import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Cross, FileSpreadsheet, Paperclip, Plus, TableOfContents, Trash2, Upload, X } from "lucide-react";
import { startTransition, useEffect, useMemo, useState } from "react";
import { FileWithPath, useDropzone } from 'react-dropzone';
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export function useStudentAddDialogState() {
  const [mode, setMode] = useState<Mode>("file");
  const [open, setOpen] = useState(false);

  return {
    state: {
      mode,
      setMode,
      open,
      setOpen
    },
    launch(mode: Mode) {
      startTransition(() => {
        setOpen(true);
        setMode(mode);
      });
    },
    close() {
      setOpen(false);
    }
  };
}

type StudentAddDialogState = ReturnType<typeof useStudentAddDialogState>["state"];

type Mode = "manual" | "file";
export { type Mode as StudentAddDialogMode };

export interface StudentAddDialogProps {
  state: StudentAddDialogState;
}

const student = z.object({
  id: z.coerce.number(),
  section: z.coerce.number(),
  group: z.string()
});

const studentFormSchema = z.object({
  students: student.array()
});

// useDropzone dont provide a method to remove files, so i wrap it
function useDropzoneFrFr() {
  const { acceptedFiles, inputRef, ...rest } = useDropzone({});

  // i hate react
  const [files, setFiles] = useState(acceptedFiles);
  useEffect(() => {
    setFiles(acceptedFiles);
  }, [acceptedFiles.length]);

  const hasFile = files.length > 0;

  const removeFiles = useMemo(() => () => {
    console.log(inputRef.current.value);
    setFiles([]);
    inputRef.current.value = ""; // bruh
  }, [inputRef]);

  return {
    ...rest,
    hasFile,
    removeFiles,
    inputRef,
    files
  };
}

export function StudentAddDialog({ state: { mode, setMode, open, setOpen } }: StudentAddDialogProps) {
  const { getInputProps, getRootProps, hasFile, files, removeFiles } = useDropzoneFrFr();

  const uploadFileMutation = useMutation({
    mutationFn: async () => {
      if (files.length === 0) return;
      // TODO: make better api wrapper
      const classId = 1;
      await api.class.edit(classId, {
        students: files[0]
      });
    },
    onError(error, variables, context) {
      toast.error("Upload error");
    },
    onSuccess() {
      setOpen(false);
    }
  });

  const addStudentsMutation = useMutation({
    mutationFn: async () => {
      // 
    }
  });

  const form = useForm({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      students: [
        {

        }
      ]
    }
  });
  const { fields, append, remove, insert } = useFieldArray({
    control: form.control, // control props comes from useForm (optional: if you are using FormProvider)
    name: "students",
  });
  const addRow = useMemo(() => () => {
    append({
      id: 1,
      group: "",
      section: 1,
    });
  }, []);

  const onAdd = useMemo(() => () => {
    if (mode === "file") {

    } else {

    }
  }, []);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 p-0 max-h-screen">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle >Add students</DialogTitle>
            <DialogDescription>
              Some text here for aesthetics
            </DialogDescription>
          </DialogHeader>

          <Tabs className="mt-1 h-96" value={mode} onValueChange={it => setMode(it as Mode)}>
            <TabsList className="w-full grid-cols-4">
              <TabsTrigger value="manual" className="flex-1 gap-3">
                <TableOfContents />
                Manual
              </TabsTrigger>
              <TabsTrigger value="file" className="flex-1 gap-3">
                <Upload />
                Upload file
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="px-6 py-6 space-y-4 overflow-auto">
              <Form {...form}>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 group">
                    <FormField
                      control={form.control}
                      name={`students.${index}.id`}
                      render={() => (
                        <FormItem className="flex-1">
                          {/* bruh */}
                          <FormLabel className="group-[:not(:first-child)]:hidden">Student ID</FormLabel>
                          <FormControl>
                            {/* TODO: design for small screen */}
                            {/* TODO: update placeholder */}
                            <Input className="w-full" placeholder="6812345678" pattern="^[0-9]\d*$" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`students.${index}.section`}
                      render={() => (
                        <FormItem>
                          <FormLabel className="group-[:not(:first-child)]:hidden">Section</FormLabel>
                          <FormControl>
                            <Input className="w-24" type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`students.${index}.group`}
                      render={() => (
                        <FormItem>
                          <FormLabel className="group-[:not(:first-child)]:hidden">Group</FormLabel>
                          <FormControl>
                            <Input className="w-24" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button variant="ghost" size="icon" className="group-[:first-child]:mt-6 transition-none" onClick={() => remove(index)}>
                      <Trash2 className="text-destructive" />
                    </Button>
                  </div>
                ))}
              </Form>

              <Button variant="ghost" className="underline underline-offset-2" onClick={addRow}>
                Add another student
              </Button>
            </TabsContent>

            <TabsContent value="file" className="py-6 px-6">
              <input {...getInputProps()} />

              {hasFile
                ? <div>
                  <FileCard file={files[0]} remove={removeFiles} />
                </div>
                : <div className="rounded-lg border-dashed border-2 cursor-pointer flex items-center justify-center h-full" {...getRootProps()}>
                  <div className="flex flex-col items-center text-muted-foreground gap-3 text-sm">
                    <Paperclip />
                    <p className="text-center leading-4">
                      Drop a file here <br />
                      .csv / .xsl
                    </p>
                  </div>
                </div>
              }
            </TabsContent>
          </Tabs>


          <DialogFooter className="px-6 pb-6 pt-6 border-t">
            <DialogClose asChild>
              <Button variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={onAdd}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


interface FileCardProps {
  file: FileWithPath;
  remove: () => any;
}

function FileCard({ file, remove }: FileCardProps) {
  return (
    <div className="border rounded-md bg-background p-3 flex gap-3 items-center">
      <div className="aspect-square">
        <div className="rounded-full bg-green-500/15 text-green-600 p-2">
          <FileSpreadsheet className="size-5" />
        </div>
      </div>
      <div className="flex-1 leading-4">
        <p className="text-sm wrap-anywhere">
          {file.name}
        </p>
        <p className="text-sm wrap-anywhere text-muted-foreground">
          {file.size} Bytes
          {/* TODO: format size string */}
        </p>
        {/* More file info */}
      </div>
      <div>
        <Button variant="ghost" size="icon" onClick={remove}>
          <Trash2 />
        </Button>
      </div>
    </div>

  );
}