'use client';

// 99% of this is by sonnet 4

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { CreateAssignmentPayload } from "@/lib/api/type";
import { unimplemented } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseDateTime } from "@internationalized/date";
import { useMutation, useSuspenseQueries } from "@tanstack/react-query";
import { Plus, Save, Trash2, X, Upload, File, Link, Link2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const createSchemas = (t: ReturnType<typeof useTranslations>) => {
  const testcaseSchema = z.object({
    input: z.string(),
    output: z.string(),
  });

  const questionSchema = z.object({
    name: z.string().min(1, t('assignment.form.validation.question.name.required')),
    description: z.string(),
    template: z.string(),
    maxScore: z.coerce.number().min(0, t('assignment.form.validation.question.maxScore.min')),
    answer: z.string(),
    testCode: z.string(),
    secretTestCode: z.string(),
    testcases: z.array(testcaseSchema),
    secretTestCases: z.array(testcaseSchema),
  });

  const assignmentSchema = z.object({
    name: z.string().min(1, t('assignment.form.validation.name.required')),
    number: z.coerce.number().min(1, t('assignment.form.validation.number.min')),
    publish: z.string().min(1, t('assignment.form.validation.publish.required')),
    due: z.string().min(1, t('assignment.form.validation.due.required')),
    languages: z.array(z.string()).min(1, t('assignment.form.validation.languages.min')),
    examMode: z.boolean(),
    closeOnDue: z.boolean(),
    showScoreOnLock: z.boolean(),
    examPin: z.string(),
    assignedGroupIds: z.array(z.string()),
    testCode: z.string(),
    secretTestCode: z.string(),
    questions: z.array(questionSchema).min(1, t('assignment.form.validation.questions.min')),
  });

  return { assignmentSchema, questionSchema, testcaseSchema };
};

// Define the form data type using the schema inference from createSchemas
type AssignmentFormData = z.infer<ReturnType<typeof createSchemas>['assignmentSchema']>;

export interface AssignmentFormProps {
  classId: number;
}

export function AssignmentForm({ classId }: AssignmentFormProps) {
  const router = useRouter();
  const t = useTranslations();

  // Parallel queries for supported languages and groups
  const [
    { data: supportedLanguages = [] },
    { data: availableGroups = [] }
  ] = useSuspenseQueries({
    queries: [
      {
        queryKey: ['supportedLanguages'],
        queryFn: () => api.supportedLanguages.list(),
      },
      {
        queryKey: ['groups', classId],
        queryFn: () => api.groups.listByClassId(classId),
      }
    ]
  });

  const { assignmentSchema } = useMemo(() => createSchemas(t), [t]);

  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      name: "",
      number: 1,
      publish: "",
      due: "",
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

  // File attachment state
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedLanguages = form.watch("languages");
  const isMultipleLanguages = selectedLanguages.length > 1;

  // Clear global test code fields when multiple languages are selected
  useEffect(() => {
    if (isMultipleLanguages) {
      form.setValue("testCode", "");
      form.setValue("secretTestCode", "");
    }
  }, [isMultipleLanguages, form]);

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
        maxScore: unimplemented("max score"),
        languages: data.languages,
        examMode: data.examMode,
        closeOnDue: data.closeOnDue,
        showScoreOnLock: data.showScoreOnLock,
        examPin: data.examPin,
        assignedGroupIds: data.assignedGroupIds, // TODO: get groups
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
        additionalFiles: attachedFiles,
      };

      console.log(payload);
      // await api.assignments.create(classId, payload);
    },
    onSuccess: () => {
      toast.success(t('assignment.form.messages.createSuccess'));
      router.push(`/instructor/class/${classId}/assignments`);
    },
    onError: (error) => {
      console.error(error);
      toast.error(t('assignment.form.messages.createError'), {
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

  // File handling functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const c = [...attachedFiles, ...Array.from(files)];
      setAttachedFiles(c);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Form {...form} >
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6 p-8">
          {/* Basic Information */}
          <section className="border rounded-xl overflow-clip flex flex-col gap-8">
            <div className="h-4 bg-primary border-b">
            </div>

            {/* Lab name */}
            <div className="border-b p-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('assignment.form.fields.name.label')}</FormLabel>
                    <FormControl>
                      <input className="text-3xl outline-offset-8 placeholder:text-muted-foreground/50" placeholder={t('assignment.form.fields.name.placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-4 px-12 gap-6 gap-y-8">
              <div className="flex flex-wrap col-span-3 gap-6">
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('assignment.form.fields.number.label')}</FormLabel>
                      <FormControl>
                        <Input className="w-36" type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date: due, publish */}
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="publish"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('assignment.form.fields.publish.label')}</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="self-end mb-2">
                    dots
                  </div>

                  <FormField
                    control={form.control}
                    name="due"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('assignment.form.fields.due.label')}</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Exam mode */}
              <div className="border-l px-6 flex flex-col gap-6 row-span-2">
                <FormField
                  control={form.control}
                  name="examMode"
                  render={({ field }) => (
                    <FormItem className="flex gap-3">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>{t('assignment.form.fields.examMode.label')}</FormLabel>
                    </FormItem>
                  )}
                />

                {form.watch("examMode") && (
                  <FormField
                    control={form.control}
                    name="examPin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('assignment.form.fields.examPin.label')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('assignment.form.fields.examPin.placeholder')}
                            maxLength={6}
                            pattern="[0-9]{6}"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('assignment.form.fields.examPin.description')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="col-span-3 flex flex-col gap-8">
                {/* Assigned Groups */}
                <div className="space-y-4">
                  <h2 className="text-lg font-medium">{t('assignment.form.sections.assignedGroups')}</h2>
                  <FormField
                    control={form.control}
                    name="assignedGroupIds"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {availableGroups.map((group: string) => (
                            <FormField
                              key={group}
                              control={form.control}
                              name="assignedGroupIds"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={group}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(group)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, group])
                                            : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== group
                                              )
                                            );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {group}
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

                {/* Languages */}
                <div className="space-y-4">
                  <h2 className="text-lg font-medium">{t('assignment.form.sections.languages')}</h2>
                  <FormField
                    control={form.control}
                    name="languages"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {supportedLanguages.map((language: string) => (
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
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="closeOnDue"
                      render={({ field }) => (
                        <FormItem className="flex gap-3">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>{t('assignment.form.fields.closeOnDue.label')}</FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="showScoreOnLock"
                      render={({ field }) => (
                        <FormItem className="flex gap-3">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>{t('assignment.form.fields.showScoreOnLock.label')}</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                </div>

              </div>

            </div>

            {/* Test Code */}
            <div className="space-y-4 px-12">
              <h2 className="text-lg font-medium">{t('assignment.form.sections.globalTestCode')}</h2>

              <div className="flex gap-6 items-start">
                <FormField
                  control={form.control}
                  name="testCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('assignment.form.fields.testCode.label')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('assignment.form.fields.testCode.placeholder')}
                          className="font-mono h-36 resize-y"
                          rows={6}
                          disabled={isMultipleLanguages}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {isMultipleLanguages
                          ? t('assignment.form.fields.testCode.disabledMultipleLanguages')
                          : t('assignment.form.fields.testCode.description')
                        }
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
                      <FormLabel>{t('assignment.form.fields.secretTestCode.label')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('assignment.form.fields.secretTestCode.placeholder')}
                          className="font-mono h-36 resize-y"
                          rows={6}
                          disabled={isMultipleLanguages}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {isMultipleLanguages
                          ? t('assignment.form.fields.secretTestCode.disabledMultipleLanguages')
                          : t('assignment.form.fields.secretTestCode.description')
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

            </div>

            {/* File Attachments */}
            <div className="px-12 pb-12 flex flex-col gap-4">
              <h2 className="text-lg font-medium">{t('assignment.form.sections.attachments')}</h2>
              <div className="grid grid-cols-2">

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={triggerFileSelect}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {t('assignment.form.buttons.selectFiles')}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="*/*"
                    />
                  </div>

                  {attachedFiles.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        {t('assignment.form.fields.attachedFiles.label')} ({attachedFiles.length})
                      </h3>
                      <div className="grid gap-2">
                        {attachedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-muted/30 border rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <File className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{file.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </section>

          <div className="space-y-4">

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">{t('assignment.form.sections.questions')}</h2>
                <Button type="button" onClick={addQuestion} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('assignment.form.buttons.addQuestion')}
                </Button>
              </div>

              {questionFields.map((question, questionIndex) => (
                <QuestionForm
                  key={question.id}
                  questionIndex={questionIndex}
                  form={form}
                  onRemove={() => removeQuestion(questionIndex)}
                  canRemove={questionFields.length > 1}
                  t={t}
                />
              ))}
            </div>

            {/* Submit */}
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={mutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {mutation.isPending ? t('assignment.form.buttons.creating') : t('assignment.form.buttons.save')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                {t('assignment.form.buttons.cancel')}
              </Button>
            </div>
          </div>
        </form>
      </Form >
    </>
  );
}

interface QuestionFormProps {
  questionIndex: number;
  form: ReturnType<typeof useForm<AssignmentFormData>>;
  onRemove: () => void;
  canRemove: boolean;
  t: any;
}

function QuestionForm({ questionIndex, form, onRemove, canRemove, t }: QuestionFormProps) {
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
    <div className="bg-card border rounded-xl p-6 space-y-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
            {questionIndex + 1}
          </div>
          <h3 className="text-xl font-semibold">
            {t('assignment.form.question.title', { number: questionIndex + 1 })}
          </h3>
        </div>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
              <FormLabel>{t('assignment.form.question.fields.name.label')}</FormLabel>
              <FormControl>
                <Input placeholder={t('assignment.form.question.fields.name.placeholder')} {...field} />
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
              <FormLabel>{t('assignment.form.question.fields.maxScore.label')}</FormLabel>
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
            <FormLabel>{t('assignment.form.question.fields.description.label')}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t('assignment.form.question.fields.description.placeholder')}
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
            <FormLabel>{t('assignment.form.question.fields.template.label')}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t('assignment.form.question.fields.template.placeholder')}
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
            <FormLabel>{t('assignment.form.question.fields.answer.label')}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t('assignment.form.question.fields.answer.placeholder')}
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
              <FormLabel>{t('assignment.form.question.fields.testCode.label')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('assignment.form.question.fields.testCode.placeholder')}
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
              <FormLabel>{t('assignment.form.question.fields.secretTestCode.label')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('assignment.form.question.fields.secretTestCode.placeholder')}
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
          <h4 className="text-lg font-semibold text-foreground">{t('assignment.form.question.testCases.title')}</h4>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => appendTestcase({ input: "", output: "" })}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('assignment.form.question.testCases.add')}
          </Button>
        </div>

        {testcaseFields.map((testcase, testcaseIndex) => (
          <div key={testcase.id} className="bg-muted/30 border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{t('assignment.form.question.testCases.testCase', { number: testcaseIndex + 1 })}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTestcase(testcaseIndex)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name={`questions.${questionIndex}.testcases.${testcaseIndex}.input`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('assignment.form.question.testCases.input')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('assignment.form.question.testCases.inputPlaceholder')}
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
                    <FormLabel>{t('assignment.form.question.testCases.output')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('assignment.form.question.testCases.outputPlaceholder')}
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
          <h4 className="text-lg font-semibold text-foreground">{t('assignment.form.question.secretTestCases.title')}</h4>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => appendSecretTestcase({ input: "", output: "" })}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('assignment.form.question.secretTestCases.add')}
          </Button>
        </div>

        {secretTestcaseFields.map((testcase, testcaseIndex) => (
          <div key={testcase.id} className="bg-muted/30 border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{t('assignment.form.question.secretTestCases.testCase', { number: testcaseIndex + 1 })}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeSecretTestcase(testcaseIndex)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name={`questions.${questionIndex}.secretTestCases.${testcaseIndex}.input`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('assignment.form.question.secretTestCases.input')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('assignment.form.question.secretTestCases.inputPlaceholder')}
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
                    <FormLabel>{t('assignment.form.question.secretTestCases.output')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('assignment.form.question.secretTestCases.outputPlaceholder')}
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