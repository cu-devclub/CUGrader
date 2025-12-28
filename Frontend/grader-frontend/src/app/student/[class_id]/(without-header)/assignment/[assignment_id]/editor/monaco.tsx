import { Editor, useMonaco, type Monaco } from "@monaco-editor/react";
import { useEffect } from "react";
import { useCodeSpaceStore } from "./data";
import { observer } from "mobx-react-lite";
import { makeAutoObservable, makeObservable } from "mobx";

type ITextModel = NonNullable<ReturnType<Monaco['editor']['getModel']>>;

export class MonacoWrapper {
  private instance: Monaco | undefined;
  activeFilePath: string | null = null;
  private pendingOperations: (() => void)[] = [];

  constructor(instance?: Monaco) {
    this.instance = instance;
    makeAutoObservable(this);
  }

  private executeWhenReady<T>(operation: () => T): Promise<T> {
    return new Promise((resolve) => {
      if (this.instance) {
        const result = operation();
        resolve(result);
      } else {
        this.pendingOperations.push(() => {
          const result = operation();
          resolve(result);
        });
      }
    });
  }

  private flushPendingOperations() {
    if (this.instance && this.pendingOperations.length > 0) {
      this.pendingOperations.forEach(op => op());
      this.pendingOperations = [];
    }
  }

  hasInstance() {
    return !!this.instance;
  }

  setInstance(instance: Monaco) {
    const previous = this.instance;
    if (previous) {
      // 
      console.log("react is ass");
      return;
    }
    this.instance = instance;
    this.flushPendingOperations();
  }

  get activeModel() {
    if (!this.activeFilePath || !this.instance) {
      return null;
    }
    return this.instance.editor.getModel(this.instance.Uri.file(this.activeFilePath));
  }

  getModel(path: string) {
    if (!this.instance) {
      return null;
    }
    return this.instance.editor.getModel(this.instance.Uri.file(path));
  }

  getContent(path: string) {
    if (!this.instance) {
      return "";
    }
    return this.getModel(path)?.getValue() ?? "";
  }

  setContent(path: string, content: string): Promise<void> {
    return this.executeWhenReady(() => {
      this.getModel(path)?.setValue(content);
    });
  }

  createFile(path: string, initialContent = "", language = "python") {
    return this.executeWhenReady(() => {
      try {
        return this.instance!.editor.createModel(initialContent, language, this.instance!.Uri.file(path));
      } catch (e) {
        // most likely due to file already exist
        console.warn(e);
        return null;
      }
    });
  }

  registerOnChange(model: ITextModel, onChange: () => unknown) {
    const dispose = model.onDidChangeContent(() => {
      onChange();
    });
    return dispose;
  }

  setActiveFile(path: string): Promise<void> {
    return this.executeWhenReady(() => {
      this.activeFilePath = path;
    });
  }

  /**
   * 
   * @param path `/path/in/this/format`
   */
  removeFile(path: string): Promise<void> {
    return this.executeWhenReady(() => {
      const model = this.getModel(path);
      if (model) {
        model.dispose();
      }
    });
  }
}


// TODO: implement the context
export const MonacoEditor = observer(() => {
  const store = useCodeSpaceStore();
  const m = useMonaco();

  useEffect(() => {
    if (m) {
      store.monaco.setInstance(m);
    }
  }, [m, store]);

  return (
    <Editor
      path={store.monaco.activeFilePath ?? undefined}
      keepCurrentModel={true}
      options={{
        automaticLayout: true
      }}
    />
  );
});