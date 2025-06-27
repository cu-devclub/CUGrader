import Editor, { useMonaco } from '@monaco-editor/react';
import * as Tabs from "@radix-ui/react-tabs";
import { CodeIcon } from 'lucide-react';
import { Ref, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { CodeSpaceTabs } from './shared';

/*
TODOS:
- polish some routing
- question switching
  - reinstatiate monaco
  - or tell it to relint somehow
- multifile template is not in the api yet
- Add new file button
- file renaming | disable it for main.* ?? | or some way to mark it as main
- examination timer
- code submission api
- test result api

- assignment card: click to publish dont work
- language selector: no ui yet
- previous version: no ui, no api

- we need some way to run the code with custom input not only the one provided
- confetti on submit

*/

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

  const onAddFile = useCallback(() => {
    // TODO: this is not yet final
  }, []);

  return (
    <CodeSpaceTabs
      className='h-full'
      tabs={tabs}
      selected={selectedFile?.name}
      onSelect={onTabSelect}
      onAdd={onAddFile}
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
