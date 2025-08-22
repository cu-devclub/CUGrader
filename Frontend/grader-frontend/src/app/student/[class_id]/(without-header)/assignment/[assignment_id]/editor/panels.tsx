import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import * as Tabs from "@radix-ui/react-tabs";
import { Check, ChevronsDown, CircleCheck, LockIcon, Plus, Terminal, X } from "lucide-react";
import { observer } from "mobx-react-lite";
import Markdown from 'react-markdown';
import { useCodeSpaceStore } from "./data";
import type { CustomTestcase, SystemTestcase } from "./data/store";
import { QuestionPagination } from "./shared";

// TODO: file downloading
export const DetailPanel = observer(() => {
  const store = useCodeSpaceStore();
  const { currentQuestionState, lab } = store;

  return (
    <div className=" h-full w-full overflow-y-auto flex flex-col gap-2">
      <div className="p-3 border-b">
        <QuestionPagination />
      </div>
      <div className="p-3 border-b">
        <div className=" flex justify-between">
          <Badge variant="secondary">Lab 1 : {lab.name}</Badge>
          <p className="text-sm font-semibold">Score: {currentQuestionState.question.maxScore}</p>
        </div>
        <p className="text-sm mt-2 text-muted-foreground">
          {lab.publish.toString()}-{lab.due.toString()}
          TODO: format this date
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
        <h1 className="text-xl font-bold">1. {currentQuestionState.question.name}</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <Markdown>{currentQuestionState.question.description}</Markdown>
        </div>
      </div>
    </div>
  );
});

export const BottomPanelContent = observer(() => {

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
        <TestcaseList />
      </Tabs.Content>
      <Tabs.Content value="your-testcase" className="flex-1 overflow-y-auto p-2">
        <CustomTestcaseList />
      </Tabs.Content>
    </Tabs.Root>
  );
});

const TestcaseList = observer(() => {
  const store = useCodeSpaceStore();
  const { currentQuestionState } = store;
  const testcases: SystemTestcase[] = currentQuestionState.testcases;

  return (
    <Tabs.Root defaultValue="0" className="h-full flex flex-col">
      <Tabs.List className="flex gap-2 mb-2 flex-wrap">
        {testcases.map((testcase, index) => (
          <Tabs.Trigger key={index} value={index.toString()} asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="data-[state=active]:bg-accent font-normal text-xs h-8"
            >
              <div className="flex items-center gap-1">
                {testcase.output !== undefined ? (
                  testcase.output === testcase.expectedOutput ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <X className="h-3 w-3 text-red-600" />
                  )
                ) : (
                  <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                )}
                Case {index + 1}
              </div>
            </Button>
          </Tabs.Trigger>
        ))}
        <Tabs.Trigger value="secret" asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="data-[state=active]:bg-accent font-normal text-xs h-8 text-destructive hover:text-destructive"
          >
            <div className="flex items-center gap-1">
              <LockIcon className="h-3 w-3" />
              Secret
            </div>
          </Button>
        </Tabs.Trigger>
      </Tabs.List>

      {testcases.map((testcase, index) => (
        <Tabs.Content key={index} value={index.toString()} className="flex-1">
          <Card className="py-4 shadow-xs">
            <CardContent className="px-3">
              <div className="flex items-center gap-2 mb-3">
                {testcase.output !== undefined ? (
                  testcase.output === testcase.expectedOutput ? (
                    <>
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-600">Case {index + 1}: Passed</span>
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-600">Case {index + 1}: Failed</span>
                    </>
                  )
                ) : (
                  <span className="font-medium text-muted-foreground">Case {index + 1}: Not executed</span>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Input:</span>
                  <pre className="mt-1 p-2 bg-muted rounded text-xs font-mono">{testcase.input}</pre>
                </div>

                <div>
                  <span className="font-medium">Expected Output:</span>
                  <pre className="mt-1 p-2 bg-muted rounded text-xs font-mono">{testcase.expectedOutput}</pre>
                </div>

                {testcase.output !== undefined && (
                  <div>
                    <span className="font-medium">Your Output:</span>
                    <pre className="mt-1 p-2 bg-muted rounded text-xs font-mono">{testcase.output}</pre>
                  </div>
                )}

                {testcase.message && (
                  <div>
                    <span className="font-medium text-red-600">Error:</span>
                    <pre className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-xs font-mono text-red-700">{testcase.message}</pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>
      ))}

      <Tabs.Content value="secret" className="flex-1">
        <div className="space-y-4">
          {/* <div className="text-center py-4 text-muted-foreground">
            <LockIcon className="size-8 mx-auto mb-2" />
            <p className="text-sm">Secret test cases - Details are hidden</p>
          </div>
           */}
          {/* Mock secret test cases - replace with actual data when available */}
          {[1, 2, 3].map((caseNum) => (
            <Card key={caseNum} className="py-4 shadow-xs">
              <CardContent className="px-3">
                <div className="flex items-center gap-2">
                  {Math.random() > 0.5 ? (
                    <>
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-600">Secret Case {caseNum}: Passed</span>
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-600">Secret Case {caseNum}: Failed</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Tabs.Content>
    </Tabs.Root>
  );
});


const CustomTestcaseList = observer(() => {
  const store = useCodeSpaceStore();
  const { currentQuestionState } = store;
  const testcases: CustomTestcase[] = currentQuestionState.customTestcases;

  const handleRemove = (index: number) => {
    currentQuestionState.removeCustomTestcase(index);
  };

  const handleAdd = () => {
    currentQuestionState.addCustomTestcase("");
  };

  const handleInputChange = (index: number, value: string) => {
    currentQuestionState.updateCustomTestcaseInput(index, value);
  };

  if (testcases.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Terminal className="size-8 mx-auto mb-2" />
        <p>No custom test cases yet</p>
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={handleAdd}>
            <Plus className="size-3 mr-1" />
            Add Test Case
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Tabs.Root defaultValue="0" className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <Tabs.List className="flex gap-2 flex-wrap">
          {testcases.map((testcase, index) => (
            <Tabs.Trigger key={index} value={index.toString()} asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="data-[state=active]:bg-accent font-normal text-xs h-8"
              >
                <div className="flex items-center gap-1">
                  {testcase.output !== undefined ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                  )}
                  Custom {index + 1}
                </div>
              </Button>
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Button variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="size-3 mr-1" />
          Add
        </Button>
      </div>

      {testcases.map((testcase, index) => (
        <Tabs.Content key={index} value={index.toString()} className="flex-1">
          <Card className="py-4 shadow-xs">
            <CardContent className="px-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {testcase.output !== undefined ? (
                    <>
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-600">Custom Case {index + 1}: Executed</span>
                    </>
                  ) : (
                    <span className="font-medium text-muted-foreground">Custom Case {index + 1}: Not executed</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="size-3" />
                </Button>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Input:</span>
                  <Textarea
                    value={testcase.input}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    placeholder="Enter your test input..."
                    className="mt-1 min-h-[80px] font-mono text-xs"
                  />
                </div>

                {testcase.output !== undefined && (
                  <div>
                    <span className="font-medium">Output:</span>
                    <pre className="mt-1 p-2 bg-muted rounded text-xs font-mono">{testcase.output}</pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
});