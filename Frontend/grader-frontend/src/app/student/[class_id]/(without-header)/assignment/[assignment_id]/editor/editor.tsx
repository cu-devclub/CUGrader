import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Editor, { useMonaco } from '@monaco-editor/react';
import { CheckIcon, CopyIcon, DownloadIcon, RefreshCcwIcon, SaveIcon, UploadIcon } from 'lucide-react';
import { Ref, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { FileTabs } from './file-tabs';

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
  savingStatus: "saving" | "unsaved" | "saved";
}

// TODO: if we want lsp then we need to run it somewhere else probably same server as the backend 💀💀💀
// we CAN use wasm but only clangd has a VERY EXPERIMENTAL support  
export function EditorPanel({ initialCodeFiles, onChange, ref, savingStatus }: EditorPanelProps) {
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
    let counter = 1;
    let newFileName = `untitled${counter}`;

    while (files.some(file => file.name === newFileName)) {
      counter++;
      newFileName = `untitled${counter}`;
    }

    const newFile: CodeFile = {
      name: newFileName,
      content: '',
      language: 'plaintext'
    };

    setFiles(prev => [...prev, newFile]);
    setSelectedFile(newFile);
  }, [files]);

  const renameFile = (file: CodeFile, newName: string) => {
    // fucking cursed
    // TODO: escape this
    file.name = newName;
    setFiles(f => [...f]);
  };

  const deleteFile = useCallback((file: CodeFile) => {
    // Remove the file from the files array
    const newFiles = files.filter(f => f !== file);
    setFiles(newFiles);
    
    // If the deleted file was selected, select another file
    if (selectedFile === file) {
      if (newFiles.length > 0) {
        setSelectedFile(newFiles[0]);
      } else {
        setSelectedFile(null);
      }
    }

    // Dispose the Monaco model for the deleted file
    if (monaco) {
      const model = monaco.editor.getModels().find(m => m.uri.path.slice(1) === file.name);
      if (model) {
        model.dispose();
      }
    }
  }, [files, selectedFile, monaco]);


  return (
    <section className='h-full grid grid-rows-[auto_1fr_auto]'>
      <FileTabs
        files={files}
        selectedFile={selectedFile}
        onTabSelect={onTabSelect}
        onAddFile={onAddFile}
        onRenameFile={renameFile}
        onDeleteFile={deleteFile}
      />

      <div className='bg-red-50 overflow-hidden'>
        {selectedFile &&
          <Editor
            path={selectedFile.name}
            options={{
              automaticLayout: true
            }}
            defaultLanguage={selectedFile.language}
            defaultValue={selectedFile.content}
          />
        }
      </div>
      <div className='text-xs border-t flex justify-between p-0.5'>
        <div className='flex gap-1'>
          <Button size="sm" className='text-xs h-7 m-0.5'> Run </Button>
          <div className="flex">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className='size-8'> <CopyIcon /> </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>t.copy</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className='size-8'> <SaveIcon /> </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>t.save</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className='size-8'> <RefreshCcwIcon /> </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>t.reset</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className='size-8'> <DownloadIcon /> </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>t.download</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className='size-8'> <UploadIcon /> </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>t.upload</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <span className='flex gap-1 font-medium items-center mr-2 text-emerald-600'>
          Saved
          <CheckIcon className='size-3.5' />
        </span>
      </div>
    </section>
  );
}
