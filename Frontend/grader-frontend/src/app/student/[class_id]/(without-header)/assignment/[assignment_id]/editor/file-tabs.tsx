import { CodeIcon, PlusIcon, XIcon } from 'lucide-react';
import * as Tabs from "@radix-ui/react-tabs";
import { CodeFile } from './editor';
import { toast } from 'sonner';
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

interface FileTabsProps {
  files: CodeFile[];
  selectedFile: CodeFile | null;
  onTabSelect: (fileName: string) => void;
  onAddFile: () => void;
  onRenameFile: (file: CodeFile, newName: string) => void;
  onDeleteFile: (file: CodeFile) => void;
}

export function FileTabs({ files, selectedFile, onTabSelect, onAddFile, onRenameFile, onDeleteFile }: FileTabsProps) {
  const handleRenameFile = (file: CodeFile, newName: string) => {
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
    onRenameFile(file, newName);
    toast.success("t.renamed");
  };

  const handleDeleteFile = (file: CodeFile) => {
    onDeleteFile(file);
    toast.success("File deleted");
  };

  const canDeleteFile = (file: CodeFile) => {
    return files.length > 1 && file !== files[0];
  };

  return (
    <Tabs.Root
      className="flex flex-col"
      defaultValue={files[0]?.name}
      value={selectedFile?.name}
      onValueChange={onTabSelect}
    >
      <Tabs.List className="text-xs border-b p-0.75 flex gap-1">
        language selector
        {files.map(file => (
          <Tabs.Trigger
            key={file.name}
            value={file.name}
            onClick={() => console.log(`clicked ${file.name}`)}
            className="group pl-1.5 first-of-type:pr-1.5 flex items-center rounded data-[state=active]:bg-accent hover:bg-accent/50 transition-colors"
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
        <button className="w-6 aspect-square flex items-center justify-center rounded hover:bg-accent" onClick={onAddFile}>
          <PlusIcon className="size-3.5" />
        </button>
      </Tabs.List>
    </Tabs.Root>
  );
}
