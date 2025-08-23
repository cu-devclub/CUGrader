import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { usePanelControl } from "@/hooks/use-panel-control";
import { StudentAssignmentDetails } from '@/lib/api/type';
import { cn } from '@/lib/utils';
import {
  ArrowLeftToLine,
  ArrowRightToLine,
  CircleArrowLeft,
  LayoutPanelLeft,
  PanelBottom,
  PanelTop,
  ChevronLeft
} from 'lucide-react';
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useState } from 'react';
import { CodeSpaceStoreContext, useCodeSpaceStore } from "./data";
import { CodeSpaceStore } from "./data/store";
import { EditorPanel } from './editor';
import { QuestionPaginationSmall } from "./shared";
import { BottomPanelContent, DetailPanel } from './panels';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerOverlay
} from "@/components/ui/drawer"


export interface CodeSpaceProps {
  lab: StudentAssignmentDetails;
}

const DesktopCodeSpaceInternal = observer(() => {
  const store = useCodeSpaceStore();
  const infoPanel = usePanelControl({ id: 'info' });
  const codePanel = usePanelControl({ id: 'code' });
  const testPanel = usePanelControl({ id: 'test' });

  return (
    <main className='flex flex-col bg-neutral-50 relative h-screen'>
      <Drawer direction='right'>
        <DrawerTrigger asChild  >
          <div className='fixed bottom-4 right-4 z-50 lg:hidden flex'>
            <Button size={'icon'} className=' rounded-full size-12'>
                <ChevronLeft/>
            </Button>
          </div>
        </DrawerTrigger>
        <DrawerContent className='!w-[90vw] overflow-y-auto overflow-x-hidden rounded-tl-xl rounded-bl-xl' >
          <DrawerHeader className='hidden'>
            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
            <DrawerDescription>This action cannot be undone.</DrawerDescription>
          </DrawerHeader>
          <DetailPanel />
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className='bg-primary text-white'>Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
        <nav className='flex items-center justify-between p-2 pb-0'>
          <Button asChild size="sm" variant="ghost" className="font-normal text-primary hover:text-primary hover:bg-primary/5 underline underline-offset-2">
            <Link href={".."}>
              <CircleArrowLeft />
              Back to problem list
            </Link>
          </Button>
          <div className="flex gap-2 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button size="icon" variant="ghost">
                  <LayoutPanelLeft />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-1">
                <div className='flex flex-col gap-2'>
                  <Button
                    variant="ghost"
                    className='h-7 w-auto px-2 flex justify-start gap-2'
                    onClick={infoPanel.toggle}
                  >
                    {infoPanel.isCollapsed ? <ArrowRightToLine className='h-4 w-4' /> : <ArrowLeftToLine className='h-4 w-4' />}
                    <span className='text-xs'>Toggle Info</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className='h-7 w-auto px-2 flex justify-start gap-2'
                    onClick={codePanel.toggle}
                  >
                    <PanelTop className='h-4 w-4' />
                    <span className='text-xs'>Toggle Code</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className='h-7 w-auto px-2 flex justify-start gap-2'
                    onClick={testPanel.toggle}
                  >
                    <PanelBottom className='h-4 w-4' />
                    <span className='text-xs'>Toggle Test</span>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <QuestionPaginationSmall
              isAtEnd={store.currentQuestionIndex === store.lab.questions.length - 1}
              onNext={store.nextQuestion}
              onPrevious={store.previousQuestion}
            />
          </div>
        </nav>
        <ResizablePanelGroup direction="horizontal" className='flex-1 p-1'>
          <ResizablePanel
            ref={infoPanel.panelRef}
            {...infoPanel.panelProps}
            collapsible
            minSize={20}
            className={cn('rounded-md lg:flex hidden bg-background m-0.5', infoPanel.isCollapsed ? 'border-transparent' : 'border')}
          >
            <DetailPanel />
          </ResizablePanel>
          <ResizableHandle className='bg-transparent' withHandle />
          <ResizablePanel collapsible minSize={10}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel
                ref={codePanel.panelRef}
                {...codePanel.panelProps}
                collapsible
                minSize={10}
                className={cn('rounded-md bg-background m-0.5', codePanel.isCollapsed ? 'border-transparent' : 'border')}
              >
                <EditorPanel />
              </ResizablePanel>
              <ResizableHandle className='bg-transparent' withHandle />
              <ResizablePanel
                ref={testPanel.panelRef}
                {...testPanel.panelProps}
                collapsible
                minSize={10}
                className={cn('rounded-md bg-background m-0.5', testPanel.isCollapsed ? 'border-transparent' : 'border')}
              >
                <BottomPanelContent />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Drawer>
    </main>
  );
});

export const DesktopCodeSpace = observer(({ lab }: CodeSpaceProps) => {
  const [store] = useState(() => new CodeSpaceStore(lab));

  return (
    <CodeSpaceStoreContext value={store}>
      <DesktopCodeSpaceInternal />
    </CodeSpaceStoreContext>
  );
});
