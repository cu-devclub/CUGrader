'use client';

import { ClassCard } from "@/components/class-card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ImageUploadPreview } from "@/components/ui/image-upload-preview";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCcw, Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useClassData } from "../../class-data-context";
import { useMemo, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

// TODO: really thing about number and string
const settingsSchema = z.object({
  courseId: z.string().min(1),
  year: z.coerce.number(),
  semester: z.string().min(1),
  name: z.string().min(1),
  image: z.instanceof(File).optional()
});

export interface SettingsFormProps {
}

export function SettingsForm() {
  const { classData } = useClassData();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: classData.name,
      courseId: classData.courseId,
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

  function reset() {
    form.reset();
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Name</FormLabel>
                  <FormDescription>
                    The name of your class that will be displayed to students.
                  </FormDescription>
                  <FormControl>
                    <Input placeholder="Programming" {...field} value={field.value ?? ''} />
                  </FormControl>
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
                  <FormDescription>
                    The course ID or course number that identifies this class (e.g., 2301107, 2301108).
                  </FormDescription>
                  <FormControl>
                    <Input placeholder="2300000" pattern="^[0-9]\d*$" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-6">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Year</FormLabel>
                    <FormDescription>
                      The academic year this class belongs to.
                    </FormDescription>
                    <FormControl>
                      <Input placeholder="2077" type="number" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Semester</FormLabel>
                    <FormDescription>
                      The semester number (e.g., 1, 2).
                    </FormDescription>
                    <FormControl>
                      <Input placeholder="1" type="number" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image"
              render={({ field: { value, onChange, ref, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Class Image</FormLabel>
                  <FormDescription>
                    An image that will be displayed at the header of the class card and class page.
                  </FormDescription>

                  <div className="flex flex-col sm:flex-row gap-4 mt-1">
                    <ClassCard
                      className="flex-1 max-w-72"
                      name={formValues.name || "Name"}
                      courseId={String(formValues.courseId) || "Course ID"}
                      semester={`${formValues.year || new Date().getFullYear()}/${formValues.semester || 1}`}
                      headerImageUrl={selectedImageFileUrl}
                    />
                    <div className="flex-1 max-w-sm sm:p-2 flex flex-col gap-3">
                      <p className="text-muted-foreground text-sm">
                        Upload an image with a 16:9 aspect ratio for best results.
                        The image will be displayed as the header of the class card.
                      </p>
                      <FormControl>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            onChange(file);
                          }}
                          ref={(e) => {
                            ref(e); // React Hook Form's ref
                            fileInputRef.current = e; // Our ref for clicking
                          }}
                          {...fieldProps}
                          className="hidden"
                        />
                      </FormControl>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Change Image
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                        >
                          Remove Image (no api yet)
                        </Button>
                      </div>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-2 mt-4">
            <Button type="submit" size="lg">
              <Save />
              Save
            </Button>
            <Button variant="secondary" type="reset" size="lg" onClick={reset}>
              <RotateCcw />
              Reset
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}