import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { cn } from '@/lib/utils';
import * as Tabs from "@radix-ui/react-tabs";
import { PlayIcon, TestTubeIcon } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { CodeSpaceTabs } from './shared';
import { CodeFile, EditorPanel, ImperativeEditorHandle } from './editor';
import { useSubmitCode } from './hooks';
import { StudentQuestion, SupportedLanguage } from '@/lib/api/type';

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
  supportedLanguages: SupportedLanguage[];
}

export function DesktopCodeSpace({ question, supportedLanguages }: CodeSpaceProps) {
  const infoPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);
  const codePanelRef = useRef<ImperativePanelHandle>(null);
  const testPanelRef = useRef<ImperativePanelHandle>(null);
  const editorRef = useRef<ImperativeEditorHandle>(null);

  // TODO: think about language selector
  const lang = supportedLanguages[0];
  const submitCode = useSubmitCode({
    getCodes: () => editorRef.current?.getCodeFiles() ?? [],
    languageId: lang.id,
    questionId: question.id,
  });

  // this must have at least 1 member
  const initialCodeFiles: CodeFile[] = useMemo(() => [
    {
      content: question.template,
      name: `main.ts`,
      language: `typescript`
    }
  ], [question]);

  function onSubmit() {
    const f = editorRef.current?.getCodeFiles();
    console.log(f);
  }

  return (
    <main className='flex flex-col bg-neutral-50 h-screen'>
      <nav className='flex items-center justify-between p-2 pb-0'>
        <div>nav</div>
        <Button size="sm" className='text-xs' onClick={onSubmit}>
          Submit
        </Button>
      </nav>
      <ResizablePanelGroup direction="horizontal" className='flex-1 p-1'>
        <ResizablePanel ref={infoPanelRef} minSize={10} className={cn('rounded-md bg-background m-0.5', infoPanelRef.current?.isCollapsed() ? 'border-transparent' : 'border')}>
          <DetailPanel question={question} />
        </ResizablePanel>
        <ResizableHandle className='bg-transparent' withHandle />
        <ResizablePanel ref={rightPanelRef} minSize={10}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel ref={codePanelRef} minSize={10} className={cn('rounded-md bg-background m-0.5', codePanelRef.current?.isCollapsed() ? 'border-transparent' : 'border')}>
              <EditorPanel
                ref={editorRef}
                initialCodeFiles={initialCodeFiles}
                onChange={() => submitCode.notifyChange()}
              />
            </ResizablePanel>
            <ResizableHandle className='bg-transparent' withHandle />
            <ResizablePanel ref={testPanelRef} minSize={10} className={cn('rounded-md bg-background m-0.5', testPanelRef.current?.isCollapsed() ? 'border-transparent' : 'border')}>
              <BottomPanelContent testcases={sampleTestCases} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}

function DetailPanel({ question }: { question: StudentQuestion; }) {
  return (
    <div className="p-4 h-full overflow-y-auto">
      <h2 className="text-xl font-semibold mb-2">{question.name}</h2>
      <div className="text-sm text-muted-foreground mb-4">
        Max Score: {question.maxScore}
      </div>
      {/* Using dangerouslySetInnerHTML for markdown/html content */}
      <div
        className="prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: question.description }}
      />
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
          name: "Code Output"
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
