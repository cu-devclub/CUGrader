import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";


interface EditDialogConfig<TPrefilled, TOutput, TKey> {
  onDone: (id: TKey, value: TOutput) => any;
}

// we can infer this tho
export interface EditDialogState<TPrefilled, TOutput> {
  open: boolean,
  loading: boolean;
  onOpenChange: (open: boolean) => any;
  prefilled?: TPrefilled,
  save: (data: TOutput) => any;
};

// i hate react
export function useEditDialogState<TPrefilled, TOutput, TKey = string>(config: EditDialogConfig<TPrefilled, TOutput, TKey>) {
  const [open, setOpen] = useState(false);
  let [loading, setLoading] = useState(false);
  let [currentPrefill, setCurrentPrefill] = useState<TPrefilled>();
  let [currentId, setCurrentId] = useState<TKey>();

  function launch(id: TKey, prefilled: TPrefilled) {
    startTransition(() => {
      setCurrentPrefill(prefilled);
      setCurrentId(id);
      setOpen(true);
    });
  }

  const save = useMemo(() => {
    return async (value: TOutput) => {
      setLoading(true);
      await config.onDone(currentId!, value); // should throw tbh
      setLoading(false);
      setOpen(false);
    };
  }, [config.onDone]);

  const state: EditDialogState<TPrefilled, TOutput> = {
    loading,
    open,
    onOpenChange: setOpen,
    prefilled: currentPrefill,
    save
  };

  return {
    launch,
    state
  };
}



// redeclaring this for some reason
export interface Student {
  studentId: string,
  name: string,
  section: number,
  group: string,
  withdrawed: boolean;
}

export type StudentWithoutIdAndName = Omit<Student, "name" | "studentId">;

export function useStudentEditDialog(classId: number, invalidate?: () => any) {
  return useEditDialogState<Student, StudentWithoutIdAndName>({
    async onDone(id, value) {
      await api.student.update(classId, id, {
        group: value.group,
        section: value.section,
        withdrawal: value.withdrawed
      });
      await invalidate?.();
    },
  });
}

interface StudentEditDialogProps {
  state: EditDialogState<Student, StudentWithoutIdAndName>;
}

const studentFormSchema = z.object({
  section: z.coerce.number(), // react is shit
  group: z.string(),
  withdrawed: z.enum(["true", "false"]) // bruhhhhh
});

type StudentFormSchema = z.infer<typeof studentFormSchema>;

export function StudentEditDialog({ state }: StudentEditDialogProps) {
  const form = useForm<StudentFormSchema>({
    resolver: zodResolver(studentFormSchema),
  });

  useEffect(() => {
    if (state.open) {
      form.reset({
        ...state.prefilled,
        withdrawed: String(state.prefilled!.withdrawed) as any
      });
    }
  }, [state.open]);

  async function onSubmit(value: StudentFormSchema) {
    if (!state.open) {
      return;
    }
    await state.save({
      ...value,
      withdrawed: value.withdrawed === "true"
    });
  }

  return (
    <Dialog open={state.open} onOpenChange={state.onOpenChange}>
      <Form {...form}>
        <DialogContent className=" sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit student</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-2">
              <FormItem>
                <FormLabel>Student ID</FormLabel>
                <FormControl>
                  <Input value={state.prefilled?.studentId ?? ""} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormLabel>Student Name</FormLabel>
                <FormControl>
                  <Input value={state.prefilled?.name ?? ""} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>

            </div>

            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="withdrawed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Withdrawal Status</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue {...field} placeholder="Select one" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* TODO: dynamic border color like the design */}
                          <SelectItem value="false">In class</SelectItem>
                          <SelectItem value="true">Withdrawed</SelectItem>
                        </SelectContent>
                      </Select>

                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Confirm</Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Form>
    </Dialog>
  );
}


export function useStudentBatchEditDialog(classId: number, invalidate?: () => any) {
  return useEditDialogState<StudentWithoutIdAndName, StudentWithoutIdAndName>({
    async onDone(id, value) {
      await api.student.update(classId, id, {
        group: value.group,
        section: value.section,
        withdrawal: value.withdrawed
      });
      await invalidate?.();
    },
  });
}

interface StudentBatchEditDialogProps {
  // bruh
  state: EditDialogState<StudentWithoutIdAndName, StudentWithoutIdAndName>;
  studentCount: number;
}

const studentBatchEditFormSchema = studentFormSchema;

export function StudentBatchEditDialog({ state, studentCount }: StudentBatchEditDialogProps) {
  const form = useForm({
    resolver: zodResolver(studentBatchEditFormSchema)
  });

  useEffect(() => {
    if (state.open) {
      form.reset();
    }
  }, [state.open]);

  async function onSubmit(value: StudentFormSchema) {
    if (!state.open) {
      return;
    }
    await state.save({
      ...value,
      withdrawed: value.withdrawed === "true"
    });
  }

  return (
    <Dialog open={state.open} onOpenChange={state.onOpenChange}>
      <Form {...form}>
        <DialogContent className=" sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit students</DialogTitle>
            <DialogDescription> {studentCount} students affected.</DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="withdrawed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Withdrawal Status</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue {...field} placeholder="Select one" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* TODO: dynamic border color like the design */}
                          <SelectItem value="false">In class</SelectItem>
                          <SelectItem value="true">Withdrawed</SelectItem>
                        </SelectContent>
                      </Select>

                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Confirm</Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Form>
    </Dialog>
  );
}