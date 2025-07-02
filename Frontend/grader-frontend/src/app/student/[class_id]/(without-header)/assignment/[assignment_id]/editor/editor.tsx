import { FileCard } from '@/components/file-card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useDropzoneFrFr } from '@/lib/file';
import Editor, { useMonaco } from '@monaco-editor/react';
import { CheckIcon, CopyIcon, DownloadIcon, FileSpreadsheet, RefreshCcwIcon, SaveIcon, UploadCloudIcon, UploadIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useCodeSpaceStore } from './data';
import { FileTabs } from './file-tabs';
import { SubmissionStatusIndicator } from './shared';

export const EditorPanel = observer(() => {
  const monaco = useMonaco();
  const store = useCodeSpaceStore();
  const { savingStatus, activeFile, save, replaceEditorContentWithFile, copy, reset, download, } = store.currentQuestionState;
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
  const dropzone = useDropzoneFrFr({
    multiple: false,
  });

  // Set monaco instance in store
  useEffect(() => {
    if (monaco) {
      store.setMonaco(monaco);
    }
  }, [monaco, store]);

  const handleFileUpload = useCallback(async () => {
    // should it replace the current file tho
    // TODO: and shuold we allow multiple file
    const file = dropzone.files[0];
    const succsss = await replaceEditorContentWithFile(file);
    setUploadDialogOpen(false);
    if (!succsss) {
      toast.error("t.error.text-file-only");
    }
  }, [store, dropzone]);

  useEffect(() => {
    if (isUploadDialogOpen) {
      dropzone.removeFiles();
    }
  }, [isUploadDialogOpen]);

  const handleCopy = useCallback(() => {
    copy();
    toast.success("t.copied");
  }, [store]);

  const handleReset = useCallback(() => {
    // TODO: might launch a dialog
    reset();
  }, [store]);

  const handleDownload = useCallback(() => {

  }, [store]);

  const handleSave = useCallback(() => {
    save();
  }, []);

  return (
    <>
      <section className='h-full grid grid-rows-[auto_1fr_auto]'>
        <FileTabs />
        <Dialog open={isUploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Files</DialogTitle>
              <DialogDescription>
                Drag and drop your files here or click to browse.
              </DialogDescription>
            </DialogHeader>
            <div {...dropzone.getRootProps()} className="rounded-lg p-4 border-dashed border-2 cursor-pointer flex items-center justify-center h-32">
              <input {...dropzone.getInputProps()} />
              {
                dropzone.files.length === 0 ? (
                  <div className="text-center">
                    <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Drag 'n' drop a file here, or click to select a file
                    </p>
                  </div>
                ) : (
                  <div>
                    <FileCard icon={FileSpreadsheet} file={dropzone.files[0]} remove={dropzone.removeFiles} />
                  </div>
                )
              }
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" onClick={() => handleFileUpload()}>
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className='bg-red-50 overflow-hidden'>
          {activeFile &&
            <Editor
              // key={`${store.lab.id}/${store.currentQuestionState.question.id}`}
              path={activeFile.id}
              options={{
                automaticLayout: true
              }}
              defaultLanguage={activeFile.language}
              defaultValue={activeFile.content}
            />
          }
        </div>
        <div className='text-xs border-t flex justify-between p-0.5'>
          <div className='flex gap-1'>
            <Button size="sm" className='text-xs h-7 m-0.5'> Run </Button>
            <div className="flex">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className='size-8' onClick={handleCopy}> <CopyIcon /> </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>t.copy</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className='size-8' onClick={handleSave}> <SaveIcon /> </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>t.save</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className='size-8' onClick={handleReset}> <RefreshCcwIcon /> </Button>
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
                  <Button size="icon" variant="ghost" className='size-8' onClick={() => setUploadDialogOpen(true)}> <UploadIcon /> </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>t.upload</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SubmissionStatusIndicator />
            {savingStatus === 'saved' && (
              <span className='flex gap-1 font-medium items-center mr-2 text-emerald-600'>
                Saved
                <CheckIcon className='size-3.5' />
              </span>
            )}
            {savingStatus === 'saving' && (
              <span className='flex gap-1 font-medium items-center mr-2 text-yellow-600'>
                Saving...
              </span>
            )}
            {savingStatus === 'unsaved' && (
              <span className='flex gap-1 font-medium items-center mr-2 text-gray-500'>
                Unsaved
              </span>
            )}
          </div>
        </div>
      </section>
    </>
  );
});
