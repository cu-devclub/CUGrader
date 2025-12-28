import { api } from "@/lib/api";
import type {
  PublicTestcaseResult,
  SecretTestcaseResult,
  StudentAssignmentDetails,
  StudentQuestion,
  SubmissionResult,
  Testcase,
} from "@/lib/api/type";
import { toObservable, toSignal } from "@/lib/reactivity";
import { makeAutoObservable, runInAction, when } from "mobx";
import type { IResource } from "mobx-utils";
import { interval, Subject } from "rxjs";
import { debounceTime, filter, switchMap, tap } from "rxjs/operators";
import type { MonacoWrapper } from "../monaco";
import { getMonacoLanguageId } from "./constant";
import type {
  UICustomTestcase,
  UIEditorFile,
  UIPublicTestcase,
  UIQuestionDetail,
  UISavingStatus,
  UISecretTestcase,
  UISubmissionStatus,
} from "./ui-types";

type LanguageId = number;
interface LanguageFiles {
  files: UIEditorFile[];
  activeFileId: string;
}

export class QuestionState {
  ready: Promise<unknown>;

  private cachedFiles: Map<LanguageId, LanguageFiles> = new Map();
  public activeLanguageId!: number;

  private submissionId: number | null;
  private submissionResult$ = toObservable(() => this.submissionId).pipe(
    filter((id) => id !== null),
    switchMap((id) =>
      interval(5000).pipe(
        switchMap(() => api.questions.getSubmissionResult(id))
        // share()
      )
    )
  );
  private submissionResult: IResource<SubmissionResult | undefined> = toSignal(
    this.submissionResult$
  );

  private fileChange$ = new Subject<void>();
  private disposables: (() => unknown)[] = [];

  // Save status tracking
  private startSavingTimestamp: number | null = null;
  private lastEdited: number | null = null;
  private lastSaved: number | null = null;
  private isSaving: boolean = false;

  // Test case data
  private publicTestcases: Testcase[] = [];
  private secretTestcases: Testcase[] = [];
  private customTestcases: { input: string; output?: string }[] = [];

  constructor(
    public question: StudentQuestion,
    private lab: StudentAssignmentDetails,
    private monaco: MonacoWrapper
  ) {
    makeAutoObservable(this);

    this.selectLanguage(question.languages[0]?.id ?? 0);
    this.submissionId = question.submission?.id ?? null;
    // this.submissionResult = toSignal(this.submissionResult$);

    this.setupAutoSave();
    this.ready = Promise.all([
      this.fetchTestcases(),
      this.restorePreviousSubmission(),
      when(() => !!this.submissionResult.current()),
    ]);
  }

  private async restorePreviousSubmission() {
    const submission = await api.questions.getSubmission(this.question.id);
    if (!submission) {
      // use defualt
      return;
    }

    runInAction(() => {
      const { code, language, submissionId } = submission;
      this.selectLanguage(language.id);
      this.submissionId = submissionId;

      this.activeLanguageFiles.files = [];
      for (const file of code) {
        const id = `${this.pathPrefix}/${
          file.pageName.includes("main") ? "main" : file.pageName + "_"
        }`;
        const language = getMonacoLanguageId(submission.language.id);
        this.monaco.removeFile(id);
        this.monaco.createFile(id, file.content, language);
        this.activeLanguageFiles.files.push({
          id,
          language,
          name: file.pageName,
        });
      }

      this.selectFile(`${this.pathPrefix}/main`);
    });
  }

  private setupAutoSave() {
    const autoSave$ = this.fileChange$
      .pipe(
        tap((_) => (this.lastEdited = Date.now())),
        debounceTime(1000) // wait 500ms after last change
      )
      .subscribe(() => {
        this.save();
      });

    this.disposables.push(() => autoSave$.unsubscribe());
  }

  private async fetchTestcases() {
    try {
      const testcases = await api.testcase.listByQuestionId(this.question.id);
      runInAction(() => {
        this.publicTestcases = testcases.public;
        this.secretTestcases = testcases.secret;
      });
    } catch (error) {
      // TODO: better error handling
      console.error("Failed to fetch test cases:", error);
    }
  }

  get savingStatus(): UISavingStatus {
    if (
      this.lastEdited &&
      (!this.startSavingTimestamp ||
        this.lastEdited > this.startSavingTimestamp)
    ) {
      return "unsaved";
    }
    if (this.isSaving) {
      return "saving";
    }
    return "saved";
  }

  // Test case related computed properties
  get uiPublicTestcases(): UIPublicTestcase[] {
    const currentResults = this.submissionResult.current();
    return this.publicTestcases.map((testcase, index) => {
      const result = currentResults?.public?.[index];
      return {
        input: testcase.input,
        expectedOutput: testcase.output,
        actualOutput: (result as any)?.output,
        status: result?.status ?? "not-executed",
        message: result?.message,
      };
    });
  }

  get uiSecretTestcases(): UISecretTestcase[] {
    const currentResults = this.submissionResult.current();
    return this.secretTestcases.map((testcase, index) => {
      const result = currentResults?.secret?.[index];
      return {
        status: result?.status ?? "not-executed",
        message: result?.message,
      };
    });
  }

  get uiCustomTestcases(): UICustomTestcase[] {
    return this.customTestcases;
  }

  get submissionStatus(): UISubmissionStatus {
    if (!this.submissionId) {
      return "not-yet";
    }

    if (this.lastEdited && this.lastSaved && this.lastEdited > this.lastSaved) {
      return "outdated";
    }

    return "submitted";
  }

  focus() {
    this.selectFile(this.activeFileId);
  }

  save = async () => {
    if (this.isSaving) return;

    this.isSaving = true;

    try {
      const codes = this.files.map((file) => ({
        content: this.monaco.getContent(file.id),
        pageName: file.name,
      }));

      this.startSavingTimestamp = Date.now();
      const result = await api.questions.submit(
        this.question.id,
        this.activeLanguageId,
        codes
      );

      runInAction(() => {
        this.submissionId = result.submissionId;
        this.lastSaved = this.startSavingTimestamp;
      });

      console.log("Files saved successfully");
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      runInAction(() => {
        this.isSaving = false;
      });
    }
  };

  private get activeLanguageFiles() {
    return this.cachedFiles.get(this.activeLanguageId)!;
  }

  get files() {
    return this.activeLanguageFiles.files;
  }

  get activeFileId() {
    return this.activeLanguageFiles.activeFileId;
  }

  get activeFile(): UIEditorFile {
    return this.files.find((it) => it.id === this.activeFileId)!;
  }

  get questionDetail(): UIQuestionDetail {
    return {
      id: this.question.id,
      number: this.question.number,
      name: this.question.name,
      description: this.question.description,
      maxScore: this.question.maxScore,
    };
  }

  get selectedLanguage() {
    return this.question.languages.find(
      (it) => it.id === this.activeLanguageId
    )!;
  }

  private get pathPrefix() {
    return `/lab${this.lab.id}/q${this.question.id}/lang${this.activeLanguageId}`;
  }

  private async createMonacoFile(file: UIEditorFile, content: string = "") {
    const model = await this.monaco.createFile(file.id, content, file.language);
    const disposable = model!.onDidChangeContent(() => {
      this.fileChange$.next();
    });

    this.disposables.push(() => disposable.dispose());
    return model;
  }

  selectLanguage = async (languageId: number) => {
    this.activeLanguageId = languageId;

    const cache = this.cachedFiles.get(languageId);
    if (cache) {
      return;
    }

    const initialFile: UIEditorFile = {
      id: `${this.pathPrefix}/main`,
      name: "main.py", // TODO: use proper extension based on language
      language: "python", // TODO: map languageId to monaco language
    };

    const languageFiles: LanguageFiles = {
      files: [initialFile],
      activeFileId: initialFile.id,
    };

    this.cachedFiles.set(languageId, languageFiles);
    await this.createMonacoFile(initialFile, this.question.template);
    this.selectFile(initialFile.id);
  };

  selectFile = (fileId: string) => {
    this.activeLanguageFiles.activeFileId = fileId;
    this.monaco.setActiveFile(fileId);
  };

  addFile = (name: string = "untitled") => {
    let withSuffix = `${name}`;
    let index = 1;
    while (this.monaco.getModel(`${this.pathPrefix}/${withSuffix}`)) {
      withSuffix = `${name}${index}`;
      index += 1;
    }

    const newFile: UIEditorFile = {
      id: `${this.pathPrefix}/${withSuffix}`,
      name: withSuffix,
      language: "python", // TODO: use current language
    };

    this.files.push(newFile);
    this.selectFile(newFile.id);
    this.createMonacoFile(newFile);
  };

  deleteFile = (fileId: string) => {
    const fileIndex = this.files.findIndex((f) => f.id === fileId);
    if (fileIndex === -1) return;

    const fileToDelete = this.files[fileIndex];
    this.files.splice(fileIndex, 1);

    if (this.activeFileId === fileToDelete.id) {
      if (this.files.length === 0) {
        throw new Error("Cannot delete the last file");
      }
      const id = this.files[Math.max(0, fileIndex - 1)].id;
      this.selectFile(id);
    }

    this.monaco.removeFile(fileToDelete.id);
  };

  renameFile = (fileId: string, newName: string) => {
    const file = this.files.find((f) => f.id === fileId);
    if (file) {
      file.name = newName;
    }
    return null;
  };

  copy = () => {
    const content = this.monaco.getContent(this.activeFileId);
    navigator.clipboard.writeText(content);
  };

  download = () => {
    // TODO: implement download functionality
  };

  reset = () => {
    // Reset all files to main with template content
    const mainFile: UIEditorFile = {
      id: `${this.pathPrefix}/main`,
      name: "main.ts",
      language: "typescript",
    };

    // Remove all Monaco models for this language
    this.files.forEach((file) => {
      if (file.id === mainFile.id) {
        this.monaco.getModel(file.id)?.setValue(this.question.template);
      } else {
        this.monaco.removeFile(file.id);
      }
    });

    // Reset files array to just main
    this.createMonacoFile(mainFile, this.question.template);
    this.activeLanguageFiles.files = [mainFile];
    this.selectFile(mainFile.id);
  };

  replaceEditorContentWithFile = async (file: File) => {
    const text = await file.text();
    if (!file.type.startsWith("text")) {
      return false;
    }
    this.monaco.setContent(this.activeFileId, text);
    return true;
  };

  run = async () => {
    if (!this.submissionId) {
      await this.save();
      return;
    }

    await api.questions.requestGrade(this.submissionId);
  };

  // Custom testcase management methods
  addCustomTestcase = (input: string) => {
    const newTestcase: UICustomTestcase = {
      input,
      output: undefined,
    };
    this.customTestcases.push(newTestcase);
  };

  updateCustomTestcaseInput = (index: number, input: string) => {
    if (this.customTestcases[index]) {
      this.customTestcases[index].input = input;
    }
  };

  removeCustomTestcase = (index: number) => {
    this.customTestcases.splice(index, 1);
  };

  dispose() {
    this.disposables.forEach((fn) => fn());
    this.fileChange$.complete();
  }
}
