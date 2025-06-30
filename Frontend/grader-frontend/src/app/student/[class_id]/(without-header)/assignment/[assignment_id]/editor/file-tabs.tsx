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
    } else if (files.some(it => it.name === newName)) {
      toast.error("t.samename");
    } else {
      onRenameFile(file, newName);
      toast.success("t.renamed");
    }
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
            className="group px-1.5 flex items-center gap-1.5 rounded data-[state=active]:bg-accent hover:bg-accent/50 transition-colors"
          >
            <CodeIcon className="size-3" />
            <span
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
                    className="ml-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded p-0.5 transition-all"
                  >
                    <XIcon className="size-3" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete File</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{file.name}"? This action cannot be undone.
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
          </Tabs.Trigger>
        ))}
        <button className="w-6 aspect-square flex items-center justify-center rounded hover:bg-accent" onClick={onAddFile}>
          <PlusIcon className="size-3.5" />
        </button>
      </Tabs.List>
    </Tabs.Root>
  );
}
