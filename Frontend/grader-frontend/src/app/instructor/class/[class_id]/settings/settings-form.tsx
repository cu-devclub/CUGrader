'use client';

import { ClassCard } from "@/components/class-card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ImageUploadPreview } from "@/components/ui/image-upload-preview";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useClassData } from "../class-data-context";
import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

// TODO: really thing about number and string
const settingsSchema = z.object({
  courseId: z.coerce.number(),
  year: z.coerce.number(),
  semester: z.coerce.number(), // idk tho summer?
  name: z.string(),
  image: z.instanceof(File).optional()
});

export interface SettingsFormProps {
  classId: number;

}

export function SettingsForm({ classId }: SettingsFormProps) {
  const { classData } = useClassData();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: classData.name,
      courseId: parseInt(classData.courseId),
      year: classData.year,
      semester: classData.semester,
      image: undefined, // TODO: get current image
    }
  });

  const mutation = useMutation({
    mutationFn: async (value: z.infer<typeof settingsSchema>) => {
      await api.classes.update(classData.id, {
        name: value.name,
        courseId: value.courseId,
        semester: `${value.year}/${value.semester}`,
        image: value.image
      });
    },
    onSuccess: () => {
      toast.success("Updated");
      queryClient.invalidateQueries({
        queryKey: ["class", classData.id]
      });
    },
    onError: (error) => {
      console.error(error);
      // TODO: global error handling
      toast.error(`An error occurred`, {
        description: error.message
      });
    }
  });

  const formValues = form.watch();
  const selectedImageFileUrl = useMemo(() => formValues.image ? URL.createObjectURL(formValues.image) : undefined, [formValues.image]);

  function onSubmit(value: z.infer<typeof settingsSchema>) {
    // TODO: tanstack
    mutation.mutate(value);
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Programming" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course ID</FormLabel>
                    <FormControl>
                      <Input placeholder="2300000" pattern="^[0-9]\d*$" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input className="w-24" placeholder="2077" type="number" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semester</FormLabel>
                      <FormControl>
                        <Input className="w-24" placeholder="1" type="number" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUploadPreview initialPreviewUrl={classData.headerImageUrl} onFileChange={(file) => field.onChange(file)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="max-w-72 space-y-2">
            <Label> Preview </Label>
            <ClassCard
              name={formValues.name || "Name"}
              courseId={String(formValues.courseId) || "Course ID"}
              semester={`${formValues.year || new Date().getFullYear()}/${formValues.semester || 1}`}
              headerImageUrl={selectedImageFileUrl}
            />
          </div>

          <Button type="submit">
            <Save />
            Save
          </Button>
        </form>
      </Form>
    </>
  );
}