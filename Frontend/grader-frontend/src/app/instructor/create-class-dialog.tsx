import { FileCard } from "@/components/file-card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useDropzoneFrFr } from "@/lib/file";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, FileSpreadsheet, Image, Paperclip, Trash2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1),
  courseId: z.string().min(1),
  year: z.coerce.number().int(), // .min(2025, { message: "fr man?" })
  semester: z.string().min(1),
  // studentFile: z.instanceof(File).optional(),
  // imageFile: z.instanceof(File).optional(),
  // form is hard...
});

interface CreateClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateClassDialog({ open, onOpenChange }: CreateClassDialogProps) {
  const queryClient = useQueryClient();
  const imageDropZone = useDropzoneFrFr();
  const studentFileDropZone = useDropzoneFrFr();

  const image = imageDropZone.files.at(0);
  const url = useMemo(() => image ? URL.createObjectURL(image) : null, [image]);

  // bruh, cleanup
  useEffect(() => {
    const u = url;
    if (u) {
      return () => URL.revokeObjectURL(u);
    }
  }, [image]);

  const form = useForm({
    resolver: zodResolver(formSchema)
  });

  const { mutate } = useMutation({
    mutationFn: (value: z.infer<typeof formSchema>) => api.classes.create({
      courseId: value.courseId,
      name: value.name,
      semester: `${value.year}/${value.semester}`,
      image,
      students: studentFileDropZone.files[0]
    }),
    async onSuccess() {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["class"]
        }),
        queryClient.invalidateQueries({
          queryKey: ["semester"]
        })
      ]);
      form.reset();
      onOpenChange(false);
    },
    onError(e) {
      console.error(e);
      toast.error("An error occurred", { description: e.message });
    }
  });

  function onSubmit(value: z.infer<typeof formSchema>) {
    mutate(value);
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-screen overflow-auto">
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-primary text-xl">Create Class</DialogTitle>
              <DialogDescription>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </DialogDescription>
            </DialogHeader>

            <div>
              <h3 className="font-medium"> Class Info </h3>
              <hr className="mt-2" />
              <div className="space-y-4 mt-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="w-full items-center gap-2">
                      <FormLabel className="font-normal">Class name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Data structures and Algorithms" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem className="w-full items-center gap-2">
                      <FormLabel className="font-normal">Class ID</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="2301111" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem className="flex flex-col flex-1 gap-2">
                        <FormLabel className="font-normal">Academic year</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} placeholder="2025" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="semester"
                    render={({ field }) => (
                      <FormItem className="flex flex-col flex-1 gap-2">
                        <FormLabel className="font-normal">Semester</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <Collapsible
              className="flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-4 ">
                <h3 className="font-medium"> Add Students <span className="font-normal text-primary/60">(Optional)</span> </h3>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7">
                    <ChevronRight />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <hr />
              <CollapsibleContent className="flex flex-col gap-2 mt-2">
                <input {...studentFileDropZone.getInputProps()} />

                {studentFileDropZone.files.length !== 0
                  ? <div>
                    <FileCard icon={FileSpreadsheet} file={studentFileDropZone.files[0]} remove={studentFileDropZone.removeFiles} />
                  </div>
                  : <div className="rounded-lg p-4 border-dashed border-2 cursor-pointer flex items-center justify-center h-32" {...studentFileDropZone.getRootProps()}>
                    <div className="flex flex-col items-center text-muted-foreground gap-3 text-sm">
                      <Paperclip />
                      <p className="text-center leading-4">
                        Drop a file here <br />
                        .csv / .xls
                      </p>
                    </div>
                  </div>
                }
              </CollapsibleContent>
            </Collapsible>

            <Collapsible
              className="flex flex-col gap-2 mt-2"
            >
              <div className="flex items-center justify-between gap-4 ">
                <h3 className="font-medium"> Class Picture <span className="font-normal text-primary/60">(Optional)</span> </h3>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7">
                    <ChevronRight />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <hr />
              <CollapsibleContent className="flex flex-col gap-2 mt-2">
                <input {...imageDropZone.getInputProps()} />

                {imageDropZone.files.length !== 0
                  ? <div className="space-y-2">
                    <img src={url!} className="rounded-md aspect-video object-cover">
                    </img>
                    <Button variant="destructive" onClick={imageDropZone.removeFiles}>
                      <Trash2 />
                      Remove
                    </Button>
                  </div>
                  : <div className="rounded-lg p-4 border-dashed border-2 cursor-pointer flex items-center justify-center h-32" {...imageDropZone.getRootProps()}>
                    <div className="flex flex-col items-center text-muted-foreground gap-3 text-sm">
                      <Image />
                      <p className="text-center leading-4">
                        Drop an image here <br />
                      </p>
                    </div>
                  </div>
                }
              </CollapsibleContent>
            </Collapsible>


            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
