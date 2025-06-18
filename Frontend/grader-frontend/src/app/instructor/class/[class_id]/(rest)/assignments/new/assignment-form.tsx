'use client';

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { CreateAssignmentPayload } from "@/lib/api/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseDateTime } from "@internationalized/date";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Save, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const createSchemas = (t: any) => {
  const testcaseSchema = z.object({
    input: z.string(),
    output: z.string(),
  });

  const questionSchema = z.object({
    name: z.string().min(1, t('assignment.form.validation.question.name.required')),
    description: z.string().min(1, t('assignment.form.validation.question.description.required')),
    template: z.string().min(1, t('assignment.form.validation.question.template.required')),
    maxScore: z.coerce.number().min(0, t('assignment.form.validation.question.maxScore.min')),
    answer: z.string().min(1, t('assignment.form.validation.question.answer.required')),
    testCode: z.string().min(1, t('assignment.form.validation.question.testCode.required')),
    secretTestCode: z.string().min(1, t('assignment.form.validation.question.secretTestCode.required')),
    testcases: z.array(testcaseSchema).min(1, t('assignment.form.validation.question.testcases.min')),
    secretTestCases: z.array(testcaseSchema).min(1, t('assignment.form.validation.question.secretTestcases.min')),
  });

  const assignmentSchema = z.object({
    name: z.string().min(1, t('assignment.form.validation.name.required')),
    number: z.coerce.number().min(1, t('assignment.form.validation.number.min')),
    publish: z.string().min(1, t('assignment.form.validation.publish.required')),
    due: z.string().min(1, t('assignment.form.validation.due.required')),
    maxScore: z.coerce.number().min(0, t('assignment.form.validation.maxScore.min')),
    languages: z.array(z.string()).min(1, t('assignment.form.validation.languages.min')),
    examMode: z.boolean(),
    closeOnDue: z.boolean(),
    showScoreOnLock: z.boolean(),
    examPin: z.string(),
    assignedGroupIds: z.array(z.string()),
    testCode: z.string().min(1, t('assignment.form.validation.testCode.required')),
    secretTestCode: z.string().min(1, t('assignment.form.validation.secretTestCode.required')),
    questions: z.array(questionSchema).min(1, t('assignment.form.validation.questions.min')),
  });

  return { assignmentSchema, questionSchema, testcaseSchema };
};

const supportedLanguages = ["C", "C++", "Java", "Python", "JavaScript", "Go", "Rust"];

// Define the form data type using the schema inference from createSchemas
type AssignmentFormData = z.infer<ReturnType<typeof createSchemas>['assignmentSchema']>;

export interface AssignmentFormProps {
  classId: number;
}

export function AssignmentForm({ classId }: AssignmentFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations();

  const { assignmentSchema } = createSchemas(t);

  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      name: "",
      number: 1,
      publish: "",
      due: "",
      maxScore: 100,
      languages: [],
      examMode: false,
      closeOnDue: false,
      showScoreOnLock: false,
      examPin: "",
      assignedGroupIds: [],
      testCode: "",
      secretTestCode: "",
      questions: [
        {
          name: "",
          description: "",
          template: "",
          maxScore: 100,
          answer: "",
          testCode: "",
          secretTestCode: "",
          testcases: [{ input: "", output: "" }],
          secretTestCases: [{ input: "", output: "" }],
        },
      ],
    },
  });

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const mutation = useMutation({
    mutationFn: async (data: AssignmentFormData) => {
      const payload: CreateAssignmentPayload = {
        name: data.name,
        number: data.number,
        publish: parseDateTime(data.publish),
        due: parseDateTime(data.due),
        maxScore: data.maxScore,
        languages: data.languages,
        examMode: data.examMode,
        closeOnDue: data.closeOnDue,
        showScoreOnLock: data.showScoreOnLock,
        examPin: data.examPin,
        assignedGroupIds: data.assignedGroupIds,
        testCode: data.testCode,
        secretTestCode: data.secretTestCode,
        questions: data.questions.map((q, index) => ({
          number: index + 1,
          name: q.name,
          description: q.description,
          template: q.template,
          maxScore: q.maxScore,
          answer: q.answer,
          testCode: q.testCode,
          secretTestCode: q.secretTestCode,
          testcases: q.testcases,
          secretTestCases: q.secretTestCases,
        })),
        additionalFiles: [],
        additionalFileIds: [],
      };

      await api.assignments.create(classId, payload);
    },
    onSuccess: () => {
      toast.success("Assignment created successfully");
      router.push(`/instructor/class/${classId}/assignments`);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create assignment", {
        description: error.message,
      });
    },
  });

  function onSubmit(data: AssignmentFormData) {
    mutation.mutate(data);
  }

  const addQuestion = () => {
    appendQuestion({
      name: "",
      description: "",
      template: "",
      maxScore: 100,
      answer: "",
      testCode: "",
      secretTestCode: "",
      testcases: [{ input: "", output: "" }],
      secretTestCases: [{ input: "", output: "" }],
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Lab 1: Hello World" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment Number</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="publish"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publish Date & Time</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    When students can start seeing this assignment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date & Time</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    When the assignment is due
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="maxScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Score</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Languages */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Supported Languages</h2>
          <FormField
            control={form.control}
            name="languages"
            render={() => (
              <FormItem>
                <FormDescription>
                  Select which programming languages students can use for this assignment.
                </FormDescription>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {supportedLanguages.map((language) => (
                    <FormField
                      key={language}
                      control={form.control}
                      name="languages"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={language}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(language)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, language])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== language
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {language}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Assignment Settings</h2>
          
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="examMode"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Exam Mode</FormLabel>
                    <FormDescription>
                      Enable exam mode for this assignment
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="closeOnDue"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Close on Due</FormLabel>
                    <FormDescription>
                      Automatically close the assignment when due date is reached
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="showScoreOnLock"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Show Score on Lock</FormLabel>
                    <FormDescription>
                      Show scores to students when the assignment is locked
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {form.watch("examMode") && (
            <FormField
              control={form.control}
              name="examPin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam PIN</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="123456" 
                      maxLength={6}
                      pattern="[0-9]{6}"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    6-digit PIN for exam mode access
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Test Code */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Global Test Code</h2>
          
          <FormField
            control={form.control}
            name="testCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Test Code</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="// Global test code that will be used for all questions"
                    className="font-mono"
                    rows={6}
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Test code that will be visible to students
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="secretTestCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secret Test Code</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="// Secret test code that will not be visible to students"
                    className="font-mono"
                    rows={6}
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Secret test code that will not be visible to students
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Questions</h2>
            <Button type="button" onClick={addQuestion} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>

          {questionFields.map((question, questionIndex) => (
            <QuestionForm
              key={question.id}
              questionIndex={questionIndex}
              form={form}
              onRemove={() => removeQuestion(questionIndex)}
              canRemove={questionFields.length > 1}
            />
          ))}
        </div>

        {/* Submit */}
        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={mutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {mutation.isPending ? "Creating..." : "Create Assignment"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}

interface QuestionFormProps {
  questionIndex: number;
  form: ReturnType<typeof useForm<AssignmentFormData>>;
  onRemove: () => void;
  canRemove: boolean;
}

function QuestionForm({ questionIndex, form, onRemove, canRemove }: QuestionFormProps) {
  const {
    fields: testcaseFields,
    append: appendTestcase,
    remove: removeTestcase,
  } = useFieldArray({
    control: form.control,
    name: `questions.${questionIndex}.testcases`,
  });

  const {
    fields: secretTestcaseFields,
    append: appendSecretTestcase,
    remove: removeSecretTestcase,
  } = useFieldArray({
    control: form.control,
    name: `questions.${questionIndex}.secretTestCases`,
  });

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Question {questionIndex + 1}</h3>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`questions.${questionIndex}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question Name</FormLabel>
              <FormControl>
                <Input placeholder="Problem A: Sum" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`questions.${questionIndex}.maxScore`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Score</FormLabel>
              <FormControl>
                <Input type="number" min="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name={`questions.${questionIndex}.description`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describe the problem..."
                rows={4}
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`questions.${questionIndex}.template`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Code Template</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="// Starter code for students"
                className="font-mono"
                rows={4}
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`questions.${questionIndex}.answer`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Model Answer</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="// Model solution"
                className="font-mono"
                rows={4}
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`questions.${questionIndex}.testCode`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test Code</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="// Test code visible to students"
                  className="font-mono"
                  rows={4}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`questions.${questionIndex}.secretTestCode`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secret Test Code</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="// Secret test code"
                  className="font-mono"
                  rows={4}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Testcases */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Test Cases</h4>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => appendTestcase({ input: "", output: "" })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Test Case
          </Button>
        </div>

        {testcaseFields.map((testcase, testcaseIndex) => (
          <div key={testcase.id} className="border rounded p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Test Case {testcaseIndex + 1}</span>
              {testcaseFields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTestcase(testcaseIndex)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name={`questions.${questionIndex}.testcases.${testcaseIndex}.input`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Input</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Input data"
                        className="font-mono"
                        rows={2}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`questions.${questionIndex}.testcases.${testcaseIndex}.output`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Output</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Expected output"
                        className="font-mono"
                        rows={2}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Secret Testcases */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Secret Test Cases</h4>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => appendSecretTestcase({ input: "", output: "" })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Secret Test Case
          </Button>
        </div>

        {secretTestcaseFields.map((testcase, testcaseIndex) => (
          <div key={testcase.id} className="border rounded p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Secret Test Case {testcaseIndex + 1}</span>
              {secretTestcaseFields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSecretTestcase(testcaseIndex)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name={`questions.${questionIndex}.secretTestCases.${testcaseIndex}.input`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Input</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Input data"
                        className="font-mono"
                        rows={2}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`questions.${questionIndex}.secretTestCases.${testcaseIndex}.output`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Output</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Expected output"
                        className="font-mono"
                        rows={2}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}