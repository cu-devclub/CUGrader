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
import { interval, Subject, timer } from "rxjs";
import { debounceTime, filter, startWith, switchMap, takeUntil, takeWhile, tap } from "rxjs";
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

  private submissionId: number | null = null;
  private submissionResult$ = toObservable(() => this.submissionId).pipe(
    // Ensure we start with the current ID to handle cases where a question 
    // already has a submission when loaded (e.g. returning to the page)
    startWith(this.submissionId),
    filter((id): id is number => id !== null),
    switchMap((id) =>
      timer(0, process.env.NODE_ENV === "development" ? 500 : 3000).pipe(
        switchMap(() => api.questions.getSubmissionResult(id)),
        // stop polling if the user modifies their code (results are no longer relevant)
        takeUntil(
          toObservable(() => this.submissionStatus).pipe(
            filter((s) => s === "outdated")
          )
        ),
        // Stop polling once all testcases are no longer pending.
        // The 'inclusive' argument ensures the final result (where pending is false) is emitted.
        takeWhile((result) => 
          result.public.some((r) => r.status === "pending") ||
          result.secret.some((r) => r.status === "pending")
        , true)
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
      // TODO: we need to register onchange to default monaco model
      return;
    }

    // restore previous submission
    runInAction(() => {
      const { code, language, submissionId } = submission;
      this.selectLanguage(language.id);
      this.submissionId = submissionId;

      this.activeLanguageFilesState.files = [];
      for (const savedFile of code) {
        const id = `${this.pathPrefix}/${
          savedFile.pageName.includes("main")
            ? "main"
            : savedFile.pageName + "_"
        }`;
        const language = getMonacoLanguageId(submission.language.id);
        this.monaco.removeFile(id);

        const file: UIEditorFile = { id, name: savedFile.pageName, language };
        this.createMonacoFile(file, savedFile.content);
        // this.monaco.createFile(id, file.content, language);
        this.activeFiles.push({
          id,
          language,
          name: savedFile.pageName,
        });
      }

      this.selectFile(`${this.pathPrefix}/main`);
    });
  }

  private setupAutoSave() {
    const autoSave$ = this.fileChange$
      .pipe(
        tap((_) => (this.lastEdited = Date.now())),
        debounceTime(500) // wait 500ms after last change
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

  get isPending(): boolean {
    return this.uiPublicTestcases.some(tc => tc.status === "pending") || 
           this.uiSecretTestcases.some(tc => tc.status === "pending");
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
        status:
          // if submissionId exist then we already submitted it and is waiting for result
          result?.status ?? (!!this.submissionId ? "pending" : "not-executed"),
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
      const codes = this.activeFiles.map((file) => ({
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
        // trigger submission polling
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

  private get activeLanguageFilesState() {
    return this.cachedFiles.get(this.activeLanguageId)!;
  }

  get activeFiles() {
    return this.activeLanguageFilesState.files;
  }

  set activeFiles(files: UIEditorFile[]) {
    this.activeLanguageFilesState.files = files;
  }

  get activeFileId() {
    return this.activeLanguageFilesState.activeFileId;
  }

  get activeFile(): UIEditorFile {
    return this.activeFiles.find((it) => it.id === this.activeFileId)!;
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

  /**
   * dont forget to add the file to our registry (activeFiles)
   */
  private async createMonacoFile(file: UIEditorFile, content: string = "") {
    // console.log(`Created ${file.name}`);

    const model = await this.monaco.createFile(file.id, content, file.language);
    const disposable = model!.onDidChangeContent(() => {
      console.log(`change`);
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
    this.activeLanguageFilesState.activeFileId = fileId;
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

    this.activeFiles.push(newFile);
    this.createMonacoFile(newFile);
    this.selectFile(newFile.id);
  };

  deleteFile = (fileId: string) => {
    const fileIndex = this.activeFiles.findIndex((f) => f.id === fileId);
    if (fileIndex === -1) return;

    const fileToDelete = this.activeFiles[fileIndex];
    this.activeFiles.splice(fileIndex, 1);

    if (this.activeFileId === fileToDelete.id) {
      if (this.activeFiles.length === 0) {
        throw new Error("Cannot delete the last file");
      }
      const id = this.activeFiles[Math.max(0, fileIndex - 1)].id;
      this.selectFile(id);
    }

    this.monaco.removeFile(fileToDelete.id);
  };

  renameFile = (fileId: string, newName: string) => {
    const file = this.activeFiles.find((f) => f.id === fileId);
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
      name: "main.py",
      language: "python",
    };

    // Remove all Monaco models for this language
    this.activeFiles.forEach((file) => {
      if (file.id === mainFile.id) {
        this.monaco.getModel(file.id)?.setValue(this.question.template);
      } else {
        this.monaco.removeFile(file.id);
      }
    });

    // Reset files array to just main
    this.activeFiles = [mainFile];
    this.createMonacoFile(mainFile, this.question.template);
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
    if (!this.submissionId || this.submissionStatus === "outdated") {
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
