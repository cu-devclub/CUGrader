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

const settingsSchema = z.object({
  courseId: z.string(),
  year: z.number(),
  semester: z.number(),
  name: z.string(),
  image: z.instanceof(File).optional()
});

export interface SettingsFormProps {
  classId: number;

}

export function SettingsForm({ classId }: SettingsFormProps) {
  const { classData } = useClassData();

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: classData.name,
      courseId: classData.courseId,
      year: classData.year,
      semester: classData.semester,
      image: undefined,
    }
  });

  // const formValue = form.getValues();
  const formValues = form.watch();
  const selectedImageFileUrl = useMemo(() => formValues.image ? URL.createObjectURL(formValues.image) : undefined, [formValues.image]);

  return (
    <>
      <Form {...form}>
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
            courseId={formValues.courseId || "Course ID"}
            semester={`${formValues.year || new Date().getFullYear()}/${formValues.semester || 1}`}
            headerImageUrl={selectedImageFileUrl}
          />
        </div>

        <Button type="submit">
          <Save />
          Save
        </Button>
      </Form>
    </>
  );
}