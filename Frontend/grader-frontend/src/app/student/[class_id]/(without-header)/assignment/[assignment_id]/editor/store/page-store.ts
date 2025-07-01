import { StudentAssignmentDetails, StudentQuestion, SubmissionResult } from "@/lib/api/type";
import { makeAutoObservable, reaction } from "mobx";
import { Monaco } from "@monaco-editor/react";
import { api } from "@/lib/api";

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

export class CodeSpaceStore {
  lab: StudentAssignmentDetails;
  questions: StudentQuestion[] = [];
  currentQuestion!: StudentQuestion;

  // Editor state for the current question
  files: EditorFile[] = [];
  activeFileId: string | null = null;
  selectedLanguageId: number = 0;
  submissionResult: SubmissionResult | null = null;

  // For submission
  lastEdited: number | null = null;
  lastSaved: number | null = null;
  isSubmitting = false;

  private _monaco!: Monaco;
  private startSavingTimestamp = 0;
  private lastEditDebouncingTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(lab: StudentAssignmentDetails) {
    makeAutoObservable(this);
    this.lab = lab;
    this.questions = lab.questions;
    if (lab.questions.length > 0) {
      // Initialize with the first question
      this.selectQuestion(lab.questions[0].id);
    } else {
      console.error("No questions found for this assignment");
    }

    reaction(
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

  get isSaved() {
    return this.lastEdited === null || (this.lastSaved !== null && this.lastSaved >= this.lastEdited);
  }

  // We need access to the monaco instance to manage models correctly
  setMonaco = (monaco: Monaco) => {
    this._monaco = monaco;
  };

  selectQuestion = (questionId: number) => {
    const question = this.questions.find(q => q.id === questionId);
    if (question) {
      this.currentQuestion = question;

      // Re-initialize editor state for the new question
      const initialFile: EditorFile = {
        id: 'main.py', // Placeholder name
        name: 'main.py',
        content: question.template,
        language: 'python', // Placeholder language
      };
      this.files = [initialFile];
      this.activeFileId = initialFile.id;
      this.selectedLanguageId = question.languages[0]?.id ?? 0;
      this.submissionResult = null;
    }
  };

  get currentQuestionIndex() {
    return this.questions.findIndex(q => q.id === this.currentQuestion.id);
  }

  nextQuestion = () => {
    const currentIndex = this.currentQuestionIndex;
    if (currentIndex < this.questions.length - 1) {
      this.selectQuestion(this.questions[currentIndex + 1].id);
    }
  };

  previousQuestion = () => {
    const currentIndex = this.currentQuestionIndex;
    if (currentIndex > 0) {
      this.selectQuestion(this.questions[currentIndex - 1].id);
    }
  };

  // Methods from QuestionEditorState
  selectFile = (fileId: string) => {
    this.activeFileId = fileId;
  };

  addFile = () => {
    let counter = 1;
    let newFileName = `untitled${counter}`;

    while (this.files.some(file => file.name === newFileName)) {
      counter++;
      newFileName = `untitled${counter}`;
    }

    const newFile: EditorFile = {
      id: newFileName,
      name: newFileName,
      content: '',
      language: 'plaintext'
    };

    this.files.push(newFile);
    this.activeFileId = newFile.id;
  };

  deleteFile = (fileId: string) => {
    const fileIndex = this.files.findIndex(f => f.id === fileId);
    if (fileIndex === -1) return;

    const fileToDelete = this.files[fileIndex];
    this.files.splice(fileIndex, 1);

    if (this.activeFileId === fileToDelete.id) {
      if (this.files.length > 0) {
        this.activeFileId = this.files[Math.max(0, fileIndex - 1)].id;
      } else {
        this.activeFileId = null;
      }
    }

    this.disposeModel(fileToDelete.name);
  };

  renameFile = (fileId: string, newName: string) => {
    const file = this.files.find(f => f.id === fileId);
    if (file) {
      // This is complex because the model in monaco is tied to the name.
      // For now, just update the name. A more robust solution is needed.
      file.name = newName;
      file.id = newName; // Assuming id is the name
    }
  };

  setLanguage = (languageId: number) => {
    this.selectedLanguageId = languageId;
  };

  // Methods from AssignmentEditorStore
  disposeModel = (fileName: string) => {
    if (!this._monaco) return;
    const model = this._monaco.editor.getModels().find(m => m.uri.path.slice(1) === fileName);
    if (model) {
      model.dispose();
    }
  };

  markAsEdited = () => {
    this.lastEdited = Date.now();
  };

  save = async () => {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.startSavingTimestamp = Date.now();

    const codes = this.getCodeFilesForCurrentQuestion();
    try {
      const result = await api.questions.submit(this.currentQuestion.id, this.selectedLanguageId, codes.map(it => ({
        content: it.content,
        pageName: it.name
      })));
      // TODO: do something with result
      this.lastSaved = this.startSavingTimestamp;
    } catch (error) {
      // TODO: handle error
      console.error("Submission failed", error);
    } finally {
      this.isSubmitting = false;
    }
  };

  getCodeFilesForCurrentQuestion = (): EditorFile[] => {
    if (!this._monaco) return [];
    const models = this._monaco.editor.getModels() ?? [];
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
}
