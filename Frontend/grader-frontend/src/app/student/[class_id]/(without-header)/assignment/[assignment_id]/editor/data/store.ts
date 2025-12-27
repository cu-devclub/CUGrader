import { api } from "@/lib/api";
import { StudentAssignmentDetails, StudentQuestion, SubmissionResult, type Testcase } from "@/lib/api/type";
import { Monaco } from "@monaco-editor/react";
import { makeAutoObservable, reaction, runInAction, when } from "mobx";
import { getMonacoLanguageId } from "./constant";

/**
 * Represents a single file (a tab) in the code editor.
 */
export interface EditorFile {
  /**
   * A unique identifier for the file. Can simply be the file's name.
   */
  id: string;
  name: string;
  content: string;
  /**
   * The language identifier for syntax highlighting in the Monaco editor (e.g., 'cpp', 'python').
   */
  language: string;
}

type LanguageId = number;
interface LanguageFiles {
  files: EditorFile[];
  activeFileId: string;
}

export interface SystemTestcase {
  input: string;
  expectedOutput: string;
  output?: string;
  message?: string;
}

export interface CustomTestcase {
  input: string;
  output?: string;
}

export class QuestionState {
  cachedFiles: Map<LanguageId, LanguageFiles> = new Map();
  activeLanguageId!: number;

  submissionResult: SubmissionResult | null;
  submissionStatus: "submitted" | "outdated" | "not-yet" = "not-yet"; // TODO: restore previous submission
  question: StudentQuestion;
  lab: StudentAssignmentDetails;

  lastSubmissionId: number | null = null;
  lastEdited: number | null = null;
  lastSaved: number | null = null;
  isSubmitting: boolean = false;
  lastEditDebouncingTimeout: ReturnType<typeof setTimeout> | null = null;
  startSavingTimestamp: number = 0;

  testcases: SystemTestcase[] = [];
  customTestcases: CustomTestcase[] = [];

  ready: Promise<void>;

  monaco: Monaco;

  constructor(question: StudentQuestion, lab: StudentAssignmentDetails, monaco: Monaco) {
    this.lab = lab;
    this.monaco = monaco;
    this.question = question;
    this.setLanguage(question.languages[0]?.id ?? 0);
    this.submissionResult = null;

    makeAutoObservable(this);

    this.loadSubmission();
    this.ready = when(() => !!this.activeFile);


    // TODO: think about disposing
    const dispose = reaction(
      () => this.lastEdited,
      () => {
        if (this.lastEditDebouncingTimeout) {
          clearTimeout(this.lastEditDebouncingTimeout);
        }
        this.lastEditDebouncingTimeout = setTimeout(() => {
          this.save();
        }, 500);
      }
    );

  }

  private async loadSubmission() {
    const submission = await api.questions.getSubmission(this.question.id);
    if (!submission) {
      return;
    }

    runInAction(() => {
      const { code, language, submissionId } = submission;
      this.setLanguage(language.id);
      this.lastSubmissionId = submissionId;

      this.activeLanguageFiles.files = code.map((it, index) => ({
        content: it.content,
        id: `${this.pathPrefix}/${it.pageName.includes("main") ? "main" : index}`, // TODO: stop use pagename as marker
        language: getMonacoLanguageId(language.id),
        name: it.pageName
      }));

      this.activeLanguageFiles.activeFileId = `${this.pathPrefix}/main`;
    });
  }

  private async pollResult() {

  }

  private get activeLanguageFiles() {
    const a = this.cachedFiles.get(this.activeLanguageId)!;
    return a;
  }

  get files() {
    return this.activeLanguageFiles.files;
  }

  get activeFileId() {
    return this.activeLanguageFiles.activeFileId;
  }

  get activeFile() {
    return this.files.find(it => it.id === this.activeFileId)!;
  }

  get selectedLanguage() {
    return this.question.languages.find(it => it.id === this.activeLanguageId)!;
  }

  get savingStatus(): "saving" | "unsaved" | "saved" {
    if (this.lastEdited && this.lastEdited > this.startSavingTimestamp) {
      return "unsaved";
    }
    if (this.isSubmitting) {
      return "saving";
    }
    if (this.isSaved) {
      return "saved";
    }
    return "unsaved";
  }

  private get isSaved() {
    return this.lastEdited === null || (this.lastSaved !== null && this.lastSaved >= this.lastEdited);
  }

  selectFile = (fileId: string) => {
    this.activeLanguageFiles.activeFileId = fileId;
  };

  addFile = () => {
    const newFile: EditorFile = {
      id: `/${this.pathPrefix}/${this.activeLanguageFiles.files.length}`,
      name: `Untitled`,
      content: '',
      language: 'plaintext'
    };

    this.files.push(newFile);
    this.selectFile(newFile.id);
  };

  deleteFile = (fileId: string) => {
    const fileIndex = this.files.findIndex(f => f.id === fileId);
    if (fileIndex === -1) return;

    const fileToDelete = this.files[fileIndex];
    this.files.splice(fileIndex, 1);

    if (this.activeFileId === fileToDelete.id) {
      if (this.files.length === 0) {
        throw new Error("wtf");
      }
      const id = this.files[Math.max(0, fileIndex - 1)].id;
      this.selectFile(id);
    }

    this.disposeModel(fileToDelete.name);
  };

  renameFile = (fileId: string, newName: string) => {
    const file = this.files.find(f => f.id === fileId);
    if (file) {
      // This is complex because the model in monaco is tied to the name.
      // For now, just update the name. A more robust solution is needed.
      file.name = newName;
      // file.id = newName; // and we dont gaf about its id
    }
  };

  get pathPrefix() {
    return `/${this.lab.id}/${this.question.id}/${this.activeLanguageId}`;
  }

  setLanguage = (languageId: number) => {
    this.activeLanguageId = languageId;
    const monacoLanguageId = getMonacoLanguageId(23);

    const cache = this.cachedFiles.get(languageId);
    if (cache) {
      return;
    }

    const initialFile: EditorFile = {
      id: `${this.pathPrefix}/main`, // this id is not gonna concern itself with filename
      name: 'main.py',
      content: this.question.template, // TODO: multi language template
      language: monacoLanguageId,
    };

    const languageFiles: LanguageFiles = {
      files: [initialFile],
      activeFileId: initialFile.id
    };
    // TODO: cache files of each languages
    this.cachedFiles.set(languageId, languageFiles);
  };

  markAsEdited = () => {
    this.lastEdited = Date.now();
  };


  // Todo: move api out
  save = async () => {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.startSavingTimestamp = Date.now();

    const codes = this.getCodeFilesForCurrentQuestion();
    try {
      const result = await api.questions.submit(this.question.id, this.activeLanguageId, codes.map(it => ({
        content: it.content,
        pageName: it.name
      })));

      runInAction(() => {
        this.lastSubmissionId = result.submissionId;
        this.lastSaved = this.startSavingTimestamp;
      });
    } catch (error) {
      // TODO: handle error
      console.error("Submission failed", error);
    } finally {
      runInAction(() => {
        this.isSubmitting = false;
      });
    }
  };

  getCodeFilesForCurrentQuestion = (): EditorFile[] => {
    if (!this.monaco) return [];
    const models = this.monaco.editor.getModels() ?? [];
    const currentFiles = this.files.map(f => f.name) ?? [];

    return models
      .filter(m => currentFiles.includes(m.uri.path.slice(1)))
      .map(it => ({
        id: it.uri.path.slice(1),
        name: it.uri.path.slice(1),
        language: it.getLanguageId(),
        content: it.getValue(),
      }));
  };

  // Methods from AssignmentEditorStore
  private disposeModel = (fileName: string) => {
    if (!this.monaco) return;
    const model = this.monaco.editor.getModels().find(m => m.uri.path.slice(1) === fileName);
    if (model) {
      model.dispose();
    }
  };

  private disposeModels = () => {
    this.monaco.editor.getModels().forEach(it => it.dispose());
  };

  get activeModel() {
    const models = this.monaco.editor.getModels();
    // console.log(models)
    return models.find(it => it.uri.path === this.activeFileId)!;
  }

  replaceEditorContentWithFile = async (file: File) => {
    const text = await file.text();
    if (!file.type.startsWith("text")) {
      return false;
    }
    this.activeModel.setValue(text);
    return true;
  };

  copy = () => {
    const code = this.activeModel.getValue();
    navigator.clipboard.writeText(code);
  };

  download = () => {
  };

  reset = () => {
    const models = this.monaco.editor.getModels();
    const mainId = `${this.pathPrefix}/main`;
    const main = models.find(it => it.uri.path === mainId);
    const affected = models.filter(it => it.uri.path.startsWith(this.pathPrefix) && it !== main);
    for (const model of affected) {
      model.dispose();
    }

    main?.setValue(this.question.template);
    this.activeLanguageFiles.files = this.activeLanguageFiles.files.filter(it => it.id === mainId);
  };

  run = async () => {
    if (!this.lastSubmissionId) {
      await this.save();
      return;
    }
    await api.questions.requestGrade(this.lastSubmissionId);
  };

  addCustomTestcase = (input: string) => {
    const newTestcase: CustomTestcase = {
      input,
      output: undefined
    };
    this.customTestcases.push(newTestcase);
  };

  updateCustomTestcaseInput = (index: number, input: string) => {
    if (this.customTestcases[index]) {
      this.customTestcases[index].input = input;
      // Clear output when input changes
      this.customTestcases[index].output = undefined;
    }
  };

  removeCustomTestcase = (index: number) => {
    this.customTestcases.splice(index, 1);
  };
}

export class CodeSpaceStore {
  lab: StudentAssignmentDetails;
  // TODO: make lab replacable
  cachedQuestionStates = new Map<number, QuestionState>;
  currentQuestionState!: QuestionState;

  private monaco!: Monaco;

  constructor(lab: StudentAssignmentDetails) {
    makeAutoObservable(this);
    this.lab = lab;
    if (lab.questions.length > 0) {
      // Initialize with the first question
      this.selectQuestion(lab.questions[0].id);
    } else {
      console.error("No questions found for this assignment");
    }
  }

  setMonaco = (monaco: Monaco) => {
    this.monaco = monaco;
    this.currentQuestionState.monaco = monaco;

    const disposables = monaco.editor.getModels().map(model =>
      model.onDidChangeContent(() => {
        this.currentQuestionState.markAsEdited();
      })
    );

    const newModelDisposable = monaco.editor.onDidCreateModel(model => {
      const d = model.onDidChangeContent(() => {
        this.currentQuestionState.markAsEdited();
      });
      disposables.push(d);
    });

    // return () => {
    //   disposables.forEach(d => d.dispose());
    //   newModelDisposable.dispose();
    // };
  };

  // TODO: wait until saved or show a dialog
  selectQuestion = (questionId: number) => {
    const existing = this.cachedQuestionStates.get(questionId);
    if (existing) {
      this.currentQuestionState = existing;
      return;
    }

    const question = this.lab.questions.find(q => q.id === questionId);
    if (question) {
      this.currentQuestionState = new QuestionState(question, this.lab, this.monaco);
    }
  };

  get currentQuestionIndex() {
    return this.lab.questions.findIndex(q => q.id === this.currentQuestionState.question.id);
  }

  nextQuestion = () => {
    const currentIndex = this.currentQuestionIndex;
    if (currentIndex < this.lab.questions.length - 1) {
      this.selectQuestion(this.lab.questions[currentIndex + 1].id);
    }
  };

  previousQuestion = () => {
    const currentIndex = this.currentQuestionIndex;
    if (currentIndex > 0) {
      this.selectQuestion(this.lab.questions[currentIndex - 1].id);
    }
  };

}
