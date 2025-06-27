import Editor, { useMonaco } from '@monaco-editor/react';
import * as Tabs from "@radix-ui/react-tabs";
import { CodeIcon } from 'lucide-react';
import { Ref, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { CodeSpaceTabs } from './shared';


export interface CodeFile {
  name: string,
  content: string;
  language: string;
}

export interface ImperativeEditorHandle {
  getCodeFiles(): CodeFile[];
}

export interface EditorPanelProps {
  initialCodeFiles: CodeFile[];
  onChange: () => unknown;
  ref?: Ref<ImperativeEditorHandle>;
}

// TODO: if we want lsp then we need to run it somewhere else probably same server as the backend 💀💀💀
// we CAN use wasm but only clangd has a VERY EXPERIMENTAL support  
export function EditorPanel({ initialCodeFiles, onChange, ref }: EditorPanelProps) {
  const monaco = useMonaco();
  const [files, setFiles] = useState(initialCodeFiles);
  const [selectedFile, setSelectedFile] = useState(files.length > 0 ? files[0] : null);

  // call onChange, this is for auto save
  useEffect(() => {
    if (!monaco) return;

    const disposables = monaco.editor.getModels().map(model =>
      model.onDidChangeContent(() => {
        onChange();
      })
    );

    const newModelDisposable = monaco.editor.onDidCreateModel(model => {
      const d = model.onDidChangeContent(() => {
        onChange();
      });
      disposables.push(d);
    });

    return () => {
      disposables.forEach(d => d.dispose());
      newModelDisposable.dispose();
    };
  }, [monaco, onChange]);

  const tabs = useMemo(() => files.map(it => ({
    id: it.name,
    icon: CodeIcon, // TODO: get language icon
    name: it.name
  })), [files]);

  useImperativeHandle(ref, () => {
    return {
      getCodeFiles() {
        // const uri = monaco!.editor.getModels().map(it => it.uri);
        // console.log({ uri });
        // return [];
        const models = monaco!.editor.getModels();

        return models.map(it => ({
          name: it.uri.path.slice(1),
          language: it.getLanguageId(),
          content: it.getValue(),
        }));
      },
    };
  });

  const onTabSelect = useCallback((id: string) => {
    setSelectedFile(files.find(it => it.name === id)!);
  }, [files]);

  return (
    <CodeSpaceTabs
      className='h-full'
      tabs={tabs}
      selected={selectedFile?.name}
      onSelect={onTabSelect}
    >
      <Tabs.Content value="main.ts" className="flex-1">
        {selectedFile &&
          <Editor
            path={selectedFile.name}
            defaultLanguage={selectedFile.language}
            defaultValue={selectedFile.content}
          />
        }
      </Tabs.Content>
    </CodeSpaceTabs>
  );
}
