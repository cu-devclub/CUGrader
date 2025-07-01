import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { CodeIcon, PlusIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { LanguageSelector } from "./shared";
import { observer } from 'mobx-react-lite';
import { useCodeSpaceStore } from './store';
import { EditorFile } from "./store/page-store";

export const FileTabs = observer(() => {
  const store = useCodeSpaceStore();
  const { 
    lab, 
    files, 
    activeFileId, 
    selectFile, 
    addFile, 
    renameFile, 
    deleteFile, 
    setLanguage, 
    selectedLanguageId,
    currentQuestion
  } = store;

  if (!currentQuestion || !lab) {
    return null; // Or a loading indicator
  }

  const selectedFile = files.find(f => f.id === activeFileId);

  const handleRenameFile = (file: EditorFile, newName: string) => {
    console.log(newName);
    if (newName.trim() === "") { // TODO: validate file name
      toast.error("t.invalid-name");
      return;
    }
    const fileWithSameName = files.find(it => it.name === newName);
    if (fileWithSameName) {
      if (fileWithSameName !== file) {
        toast.error("t.samename");
      }
      return;
    }
    renameFile(file.id, newName);
    toast.success("t.renamed");
  };

  const handleDeleteFile = (file: EditorFile) => {
    deleteFile(file.id);
    toast.success("File deleted");
  };

  const canDeleteFile = (file: EditorFile) => {
    return files.length > 1 && file !== files[0];
  };

  return (
    <Tabs.Root
      className="flex flex-col"
      defaultValue={files[0]?.name}
      value={selectedFile?.name}
      onValueChange={selectFile}
    >
      <Tabs.List className="flex gap-1 border-b p-0.75 text-xs">
        <LanguageSelector
          supportedLanguages={currentQuestion.languages}
          selectedLanguageId={selectedLanguageId}
          onLanguageChange={setLanguage}
        />
        {files.map((file) => (
          <Tabs.Trigger
            key={file.name}
            value={file.name}
            onClick={() => console.log(`clicked ${file.name}`)}
            className="group flex items-center rounded pl-1.5 first-of-type:pr-1.5 data-[state=active]:bg-accent hover:bg-accent/50 transition-colors"
            asChild
          >
            <div>
              <CodeIcon className="size-3" />
              <span
                className='ml-1'
                role="textbox"
                suppressContentEditableWarning
                onBlur={(event) => handleRenameFile(file, event.currentTarget.innerText)}
                onKeyDown={event => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    event.currentTarget.blur();
                  }
                }}
                contentEditable={file === selectedFile}
                dangerouslySetInnerHTML={{ __html: file.name }}
              >
              </span>
              {canDeleteFile(file) && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      onClick={(event) => event.stopPropagation()}
                      className="hover:bg-red-500/20 p-1 rounded transition-all mx-0.5 opacity-0 group-data-[state=active]:opacity-100"
                    >
                      <XIcon className="size-3" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete File</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &quot;{file.name}&quot;? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteFile(file)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </Tabs.Trigger>
        ))}
        <button className="w-6 aspect-square flex items-center justify-center rounded hover:bg-accent" onClick={addFile}>
          <PlusIcon className="size-3.5" />
        </button>
      </Tabs.List>
    </Tabs.Root>
  );
});
