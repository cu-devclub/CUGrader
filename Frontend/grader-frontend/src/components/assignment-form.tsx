'use client';

// 99% of this is by sonnet 4

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useDropzoneFrFr } from "@/lib/file";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSuspenseQueries } from "@tanstack/react-query";
import { FileIcon, Paperclip, Plus, Save, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Control, useFieldArray, useForm, useWatch } from "react-hook-form";
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
    languageIds: z.array(z.number()).min(1, t('assignment.form.validation.languages.min')),
    examMode: z.boolean(),
    allowLateSubmission: z.boolean(),
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

function AssignmentName({ control }: { control: Control<AssignmentFormData>; }) {
  const name = useWatch({
    control,
    name: 'name',
    defaultValue: ""
  });

  return <h2 className="font-medium">{name.length === 0 ? "Name" : name}</h2>;
}

function AssignmentNumber({ control }: { control: Control<AssignmentFormData>; }) {
  const number = useWatch({
    control,
    name: 'number',
    defaultValue: 1
  });

  return <p className="text-sm">Lab {number}</p>;
}

export interface AssignmentFormProps {
  classId: number;
  prefill?: AssignmentFormData;
  existingFiles?: AttachmentMetadata[];

  isPending: boolean;
  submit: (result: AssignmentFormResult) => unknown;
  cancel: () => unknown;
}

export type AssignmentFormResult = AssignmentFormData & {
  toRemoveExistingFileIds: number[];
  readonly additionalFiles: File[];
};

export interface AttachmentMetadata {
  id: number;
  name: string;
  // TODO: request an api for this...
  // size maybe
}

export function AssignmentForm({ submit, cancel, classId, prefill, existingFiles = [], isPending }: AssignmentFormProps) {
  const t = useTranslations();

  const [
    { data: supportedLanguages },
    { data: availableGroups }
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
    defaultValues: prefill ?? {
      name: "",
      number: 1,
      publish: "",
      due: "",
      languageIds: [],
      examMode: false,
      allowLateSubmission: true,
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

  const selectedLanguages = form.watch("languageIds");
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

  const attachmentDropzone = useDropzoneFrFr();

  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // we shuold move this out

  function onSubmit(data: AssignmentFormData) {
    submit({
      ...data,
      toRemoveExistingFileIds,
      additionalFiles: [...attachmentDropzone.files] as File[]
    });
  }

  const handleSave = () => {
    setShowSaveDialog(true);
  };

  const handleCancel = () => {
    setShowDiscardDialog(true);
  };

  const confirmSave = () => {
    setShowSaveDialog(false);
    form.handleSubmit(onSubmit)();
  };

  const confirmDiscard = () => {
    setShowDiscardDialog(false);
    cancel();
  };

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

  const [toRemoveExistingFileIds, setToRemoveExistingFileIds] = useState([] as number[]);
  const filteredExistingFiles = existingFiles.filter(it => !toRemoveExistingFileIds.includes(it.id));
  function removeExistingFile(fileId: number) {
    setToRemoveExistingFileIds([...toRemoveExistingFileIds, fileId]);
  }

  // This run like shit,
  // const name = form.watch("name");

  return (
    <>
      <nav className="sticky top-0 bg-background flex flex-col shadow">
        <div className="flex justify-between items-center flex-1 py-3 px-12">
          <div className="flex flex-col leading-5">
            <AssignmentNumber control={form.control} />
            <AssignmentName control={form.control} />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              {t('assignment.form.buttons.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              <Save className="w-4 h-4 mr-2" />
              {isPending
                ? (prefill ? t('assignment.form.buttons.saving') : t('assignment.form.buttons.creating'))
                : (prefill ? t('assignment.form.buttons.save') : t('assignment.form.buttons.create'))
              }
            </Button>
          </div>
        </div>
        <div className="h-2 bg-primary border-b">
        </div>
      </nav>
      <Form {...form} >
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6 p-12">
          {/* Basic Information */}
          <section className="border rounded-xl overflow-clip flex flex-col gap-8">

            {/* Lab name */}
            <div className="border-b">
              <div className="h-4 bg-primary border-b">
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="p-8">
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
                <div className="flex gap-2 items-start">
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

                  <div className="self-start mt-7">
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
                                    className="flex flex-row gap-3"
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
                    name="languageIds"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {supportedLanguages.map((language) => (
                            <FormField
                              key={language.id}
                              control={form.control}
                              name="languageIds"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={language.id}
                                    className="flex flex-row gap-3"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(language.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, language.id])
                                            : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== language.id
                                              )
                                            );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {language.name}
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
                      name="allowLateSubmission"
                      render={({ field }) => (
                        <FormItem className="flex gap-3">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>{t('assignment.form.fields.allowLateSubmission.label')}</FormLabel>
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

              <div className="grid grid-cols-2 gap-6 items-start">
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

              <div className="grid grid-cols-2 gap-6">

                <div className="rounded-lg p-4 border-dashed border-2 cursor-pointer flex items-center justify-center min-h-48" {...attachmentDropzone.getRootProps()}>
                  <div className="flex flex-col items-center text-muted-foreground gap-3 text-sm">
                    <Paperclip />
                    <p className="text-center leading-4">
                      t.drop_files_here <br />
                    </p>
                    <input {...attachmentDropzone.getInputProps()} />
                  </div>
                </div>

                <div className="space-y-4">
                  {attachmentDropzone.files.length > 0 && (
                    <div className="grid gap-2">
                      {filteredExistingFiles.map((file, index) => (
                        <FileCard
                          name={file.name}
                          remove={() => removeExistingFile(file.id)}
                          key={index}
                        />
                      ))}

                      {attachmentDropzone.files.map((file, index) => (
                        <FileCard
                          name={file.name}
                          remove={() => attachmentDropzone.removeFile(index)}
                          size={file.size}
                          key={index}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </section>

          <div className="space-y-4">

            {/* Questions */}
            <div className="space-y-4">
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

              <Button onClick={() => addQuestion()} type="button">
                Add question (todo: style this)
              </Button>
            </div>

            {/* Submit */}
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isPending}>
                <Save className="w-4 h-4 mr-2" />
                {isPending
                  ? (prefill ? t('assignment.form.buttons.saving') : t('assignment.form.buttons.creating'))
                  : (prefill ? t('assignment.form.buttons.save') : t('assignment.form.buttons.create'))
                }
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                {t('assignment.form.buttons.cancel')}
              </Button>
            </div>
          </div>
        </form>
      </Form >

      {/* Discard Changes Dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes.
              Are you sure you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDiscard}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lab saved!</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave}>See lab list</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface QuestionFormProps {
  questionIndex: number;
  form: ReturnType<typeof useForm<AssignmentFormData>>;
  onRemove: () => void;
  canRemove: boolean;
  t: ReturnType<typeof useTranslations>;
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
    <section className="border rounded-xl overflow-clip flex flex-col gap-8">
      {/* Question name */}
      <div className="border-b">
        <div className="h-4 bg-muted-foreground/50 border-b">
        </div>

        <div className="flex">
          <div className="p-8">
            <Label>
              {t('assignment.form.question.no')}
            </Label>
            <div className="text-center text-3xl mt-4">
              {questionIndex + 1}.
            </div>
          </div>

          <FormField
            control={form.control}
            name={`questions.${questionIndex}.name`}
            render={({ field }) => (
              <FormItem className="p-8 flex-1">
                <FormLabel>{t('assignment.form.question.title')}</FormLabel>
                <FormControl>
                  <input className="text-3xl outline-offset-8 placeholder:text-muted-foreground/50" placeholder={t('assignment.form.question.titlePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {canRemove && (
            <div className="flex items-center justify-between p-3 ">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onRemove}
                className="size-fit p-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <X className="size-6" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 px-12 items-start">
        <FormField
          control={form.control}
          name={`questions.${questionIndex}.description`}
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>{t('assignment.form.question.fields.description.label')}</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-24 resize-y"
                  placeholder={t('assignment.form.question.fields.description.placeholder')}
                  rows={6}
                  {...field}
                />
              </FormControl>
              <p>todo: md editor</p>
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

      <div className="px-12 flex flex-col gap-8">
        <FormField
          control={form.control}
          name={`questions.${questionIndex}.answer`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('assignment.form.question.fields.answer.label')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('assignment.form.question.fields.answer.placeholder')}
                  className="font-mono resize-y min-h-24"
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
                  className="font-mono resize-y min-h-24"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="px-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`questions.${questionIndex}.testCode`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('assignment.form.question.fields.testCode.label')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('assignment.form.question.fields.testCode.placeholder')}
                  className="font-mono resize-y min-h-24"
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
                  className="font-mono resize-y min-h-24"
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
      <div className="px-12 space-y-4">
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
                        className="font-mono resize-y min-h-24"
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
                        className="font-mono resize-y min-h-24"
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
      <div className="px-12 pb-12 space-y-4">
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
                        className="font-mono resize-y min-h-24"
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
                        className="font-mono resize-y min-h-24"
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
    </section>
  );
}

interface FileCardProps {
  name: string;
  size?: number;
  remove: () => unknown;
}

function FileCard({ name, remove, size }: FileCardProps) {
  return <div
    className="flex items-center justify-between p-3 bg-muted/30 border rounded-lg"
  >
    <div className="flex items-center gap-2">
      <FileIcon className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm font-medium">{name}</span>
      {
        size &&
        <span className="text-xs text-muted-foreground">
          ({(size / 1024).toFixed(1)} KB)
        </span>
      }
    </div>
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => remove()}
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
    >
      <X className="w-4 h-4" />
    </Button>
  </div>;
}
