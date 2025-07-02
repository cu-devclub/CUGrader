import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Editor, { useMonaco } from '@monaco-editor/react';
import { CheckIcon, CopyIcon, DownloadIcon, RefreshCcwIcon, SaveIcon, UploadIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useCodeSpaceStore } from './data';
import { FileTabs } from './file-tabs';
import { SubmissionStatusIndicator } from './shared';

export const EditorPanel = observer(() => {
  const monaco = useMonaco();
  const store = useCodeSpaceStore();
  const { savingStatus, activeFile, selectedLanguage } = store.currentQuestionState;

  // Set monaco instance in store
  useEffect(() => {
    if (monaco) {
      store.setMonaco(monaco);
    }
  }, [monaco, store]);

  return (
    <section className='h-full grid grid-rows-[auto_1fr_auto]'>
      <FileTabs />

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
  );
});
