import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { usePanelControl } from '@/hooks/use-panel-control';
import { StudentAssignmentDetails, StudentQuestion, SupportedLanguage } from '@/lib/api/type';
import { cn } from '@/lib/utils';
import * as Tabs from "@radix-ui/react-tabs";
import {
  ArrowLeftToLine,
  ArrowRightToLine,
  LayoutPanelLeft,
  PanelBottom,
  PanelTop,
  PlayIcon,
  TestTubeIcon
} from 'lucide-react';
import { useMemo, useRef } from 'react';
import Markdown from 'react-markdown';
import { CodeFile, EditorPanel, ImperativeEditorHandle } from './editor';
import { useSubmitCode } from './hooks';
import { CodeSpaceTabs } from './shared';

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
  question: StudentQuestion;
  lab: StudentAssignmentDetails;
}

export function DesktopCodeSpace({ question, lab }: CodeSpaceProps) {
  const editorRef = useRef<ImperativeEditorHandle>(null);

  const infoPanel = usePanelControl({ id: 'info' });
  const codePanel = usePanelControl({ id: 'code' });
  const testPanel = usePanelControl({ id: 'test' });

  const lang = question.languages[0];
  const submitCode = useSubmitCode({
    getCodes: () => editorRef.current?.getCodeFiles() ?? [],
    languageId: lang.id,
    questionId: question.id,
  });

  // this must have at least 1 member
  const initialCodeFiles: CodeFile[] = useMemo(() => [
    {
      content: question.template,
      name: `main.${getFileExtension(lang)}`,
      language: getMonacoLanguageId(lang),
    }
  ], [question, lang]);

  function onSubmit() {
    const f = editorRef.current?.getCodeFiles();
    console.log(f);
  }

  return (
    <main className='flex flex-col bg-neutral-50 h-screen'>
      <nav className='flex items-center justify-between p-2 pb-0'>
        <Popover>
          <PopoverTrigger asChild>
            <Button size="icon" variant="ghost" className='h-7 w-7'>
              <LayoutPanelLeft className='h-4 w-4' />
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
        <Button size="sm" className='text-xs' onClick={onSubmit}>
          Submit
        </Button>
      </nav>
      <ResizablePanelGroup direction="horizontal" className='flex-1 p-1'>
        <ResizablePanel
          ref={infoPanel.panelRef}
          {...infoPanel.panelProps}
          collapsible
          minSize={10}
          className={cn('rounded-md bg-background m-0.5', infoPanel.isCollapsed ? 'border-transparent' : 'border')}
        >
          <DetailPanel question={question} lab={lab} />
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
              <EditorPanel
                savingStatus='saved'
                ref={editorRef}
                initialCodeFiles={initialCodeFiles}
                onChange={() => submitCode.notifyChange()}
              />
            </ResizablePanel>
            <ResizableHandle className='bg-transparent' withHandle />
            <ResizablePanel
              ref={testPanel.panelRef}
              {...testPanel.panelProps}
              collapsible
              minSize={10}
              className={cn('rounded-md bg-background m-0.5', testPanel.isCollapsed ? 'border-transparent' : 'border')}
            >
              <BottomPanelContent testcases={sampleTestCases} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}

function DetailPanel({ question, lab }: { question: StudentQuestion, lab: StudentAssignmentDetails; }) {
  return (
    <div className="p-4 h-full overflow-y-auto flex flex-col gap-2">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <div className="flex justify-between">
        <Badge>Lab 1 : {question.name}</Badge>
        <p className="text-sm font-semibold">Score: {question.maxScore}</p>
      </div>
      <p className="text-sm text-muted-foreground">
        {lab.publish.toString()}
        {lab.due.toString()}
      </p>
      <div>
        <h1 className="text-xl font-bold">1. Question title</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <Markdown>{question.description}</Markdown>
        </div>
      </div>
    </div>
  );
}

interface BottomPanelContent {
  testcases: TestcaseInfo[];
}

const sampleTestCases: TestcaseInfo[] = [
  {
    type: "public",
    input: "5",
    expectedOutput: "120",
    output: "120",
    message: "Correct factorial calculation"
  },
  {
    type: "public",
    input: "0",
    expectedOutput: "1",
    output: "0",
    message: "Edge case: factorial of 0 should be 1"
  },
  {
    type: "public",
    input: "3",
    expectedOutput: "6",
    output: "6",
    message: ""
  },
  {
    type: "secret",
    message: "Passed"
  },
  {
    type: "secret",
    message: "Failed: timeout"
  }
];

function BottomPanelContent({ testcases }: BottomPanelContent) {
  return (
    <CodeSpaceTabs
      className='h-full'
      tabs={[
        {
          id: "testcase",
          icon: TestTubeIcon,
          name: "Test Case"
        },
        {
          id: "output",
          icon: PlayIcon,
          name: "Idk"
        },
      ]}
      onSelect={() => { }}
    >
      <Tabs.Content value="output" className="flex-1 p-4">
        <div className="text-sm text-muted-foreground">Code output will appear here...</div>
      </Tabs.Content>
      <Tabs.Content value="testcase" className="flex-1 p-4 space-y-3 overflow-y-auto">
        {testcases.map((testcase, index) => (
          <TestCaseDisplay key={index} testcase={testcase} />
        ))}
      </Tabs.Content>
    </CodeSpaceTabs>
  );
}

interface UnitTestInfo {
  type: "unit-public";
  message: string;
}

interface PrivateUnitTestInfo {
  type: "unit-private";
  message: string;
}

type PublicTestcaseInfo = {
  type: "public";
  input: string;
  expectedOutput: string;
  output: string;
  message: string;
};

type SecretTestcaseInfo = {
  type: "secret";
  message: string;
};

type TestcaseInfo = PublicTestcaseInfo | SecretTestcaseInfo;

function TestCaseDisplay({ testcase }: { testcase: TestcaseInfo; }) {
  if (testcase.type === "secret") {
    const isPassing = testcase.message.toLowerCase().includes("pass");
    return (
      <div className="border rounded-md p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isPassing ? "bg-green-500" : "bg-red-500"
          )} />
          <span className={cn(
            "text-sm font-medium",
            isPassing ? "text-green-700" : "text-red-700"
          )}>
            Secret Test Case
          </span>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Message:</label>
          <p className="text-xs text-muted-foreground mt-1">{testcase.message}</p>
        </div>
      </div>
    );
  }

  const isPassing = testcase.output === testcase.expectedOutput;

  return (
    <div className="border rounded-md p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-2 h-2 rounded-full",
          isPassing ? "bg-green-500" : "bg-red-500"
        )} />
        <span className={cn(
          "text-sm font-medium",
          isPassing ? "text-green-700" : "text-red-700"
        )}>
          {isPassing ? "Passed" : "Failed"}
        </span>
      </div>

      <div className="grid gap-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Input:</label>
          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">{testcase.input}</pre>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Expected Output:</label>
          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">{testcase.expectedOutput}</pre>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Your Output:</label>
          <pre className={cn(
            "text-xs p-2 rounded mt-1 overflow-x-auto",
            isPassing ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          )}>{testcase.output}</pre>
        </div>

        {testcase.message && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">Message:</label>
            <p className="text-xs text-muted-foreground mt-1">{testcase.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
