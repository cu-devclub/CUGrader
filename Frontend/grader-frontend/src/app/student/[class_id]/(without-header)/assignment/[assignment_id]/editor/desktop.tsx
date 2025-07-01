import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { usePanelControl } from "@/hooks/use-panel-control";
import { StudentAssignmentDetails, SupportedLanguage, Testcase } from '@/lib/api/type';
import { cn } from '@/lib/utils';
import * as Tabs from "@radix-ui/react-tabs";
import {
  ArrowLeftToLine,
  ArrowRightToLine,
  ChevronsDown,
  CircleArrowLeft,
  CircleCheck,
  LayoutPanelLeft,
  PanelBottom,
  PanelTop,
  Terminal
} from 'lucide-react';
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useState } from 'react';
import Markdown from 'react-markdown';
import { EditorPanel } from './editor';
import { QuestionPagination, QuestionPaginationSmall } from "./shared";
import { CodeSpaceStoreContext, useCodeSpaceStore } from "./store";
import { CodeSpaceStore } from "./store/page-store";

// TODO: extract this to seperated file
function getMonacoLanguageId(language: SupportedLanguage) {
  // TODO: properly implement this
  return "typescript";
}

function getFileExtension(language: SupportedLanguage) {
  // TODO: properly implement this

  return "ts";
}

export interface CodeSpaceProps {
  lab: StudentAssignmentDetails;
}

const DesktopCodeSpaceInternal = observer(() => {
  const store = useCodeSpaceStore();
  const infoPanel = usePanelControl({ id: 'info' });
  const codePanel = usePanelControl({ id: 'code' });
  const testPanel = usePanelControl({ id: 'test' });

  return (
    <main className='flex flex-col bg-neutral-50 h-screen'>
      <nav className='flex items-center justify-between p-2 pb-0'>
        <Button asChild size="sm" variant="ghost" className="font-normal text-primary hover:text-primary hover:bg-primary/5 underline underline-offset-2">
          <Link href={""}>
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
            isAtEnd={store.currentQuestionIndex === store.questions.length - 1}
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
          minSize={10}
          className={cn('rounded-md bg-background m-0.5', infoPanel.isCollapsed ? 'border-transparent' : 'border')}
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

// TODO: file downloading
const DetailPanel = observer(() => {
  const store = useCodeSpaceStore();
  const { currentQuestion, lab } = store;

  return (
    <div className=" h-full overflow-y-auto flex flex-col gap-2">
      <div className="p-3 border-b">
        <QuestionPagination />
      </div>
      <div className="p-3 border-b">
        <div className=" flex justify-between">
          <Badge variant="secondary">Lab 1 : {currentQuestion.name}</Badge>
          <p className="text-sm font-semibold">Score: {currentQuestion.maxScore}</p>
        </div>
        <p className="text-sm mt-2 text-muted-foreground">
          {lab.publish.toString()}
          {lab.due.toString()}
        </p>
        <Collapsible>
          <div className="flex justify-end">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <ChevronsDown />
                <span className="sr-only">Lab Details</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            we dont have lab description....
          </CollapsibleContent>
        </Collapsible>
      </div>
      <div className="p-3">
        <h1 className="text-xl font-bold">1. Question title</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <Markdown>{currentQuestion.description}</Markdown>
        </div>
      </div>
    </div>
  );
});

const BottomPanelContent = observer(() => {
  const store = useCodeSpaceStore();
  const testcases = [] as Testcase[]; // TODO: api for this

  return (
    <Tabs.Root defaultValue="testcase" className="h-full flex flex-col">
      <Tabs.List className="text-xs border-b p-0.75 flex gap-1">
        <Tabs.Trigger
          value="testcase"
          className="p-1 px-1.5 flex items-center gap-1.5 rounded data-[state=active]:bg-accent hover:bg-accent/50 transition-colors"
        >
          <CircleCheck className="size-3" />
          Test case
        </Tabs.Trigger>
        <Tabs.Trigger
          value="your-testcase"
          className="p-1 px-1.5 flex items-center gap-1.5 rounded data-[state=active]:bg-accent hover:bg-accent/50 transition-colors"
        >
          <Terminal className="size-3" />
          Your test case
        </Tabs.Trigger>

      </Tabs.List>

      <Tabs.Content value="testcase" className="flex-1 overflow-y-auto p-2">
        <div className="flex flex-col gap-2">
          {testcases.map((testcase: Testcase, i: number) => (
            <div key={i} className="flex flex-col gap-1 rounded-md border p-2">
              <p className="text-sm font-semibold">Sample {i + 1}</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Input</p>
                  <div className="text-sm font-mono bg-neutral-100 p-1 rounded-sm">{testcase.input}</div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Output</p>
                  <div className="text-sm font-mono bg-neutral-100 p-1 rounded-sm">{testcase.output}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Tabs.Content>
      <Tabs.Content value="your-testcase" className="flex-1 overflow-y-auto p-2">
        your-testcase
      </Tabs.Content>
    </Tabs.Root>
  );
});
