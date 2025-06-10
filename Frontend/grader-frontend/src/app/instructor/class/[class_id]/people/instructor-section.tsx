'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { api } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Edit2, Plus, Trash2, User } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface InviteFormProps {
  onAdd: (email: string) => any;
  title: string;
}

const inviteFormSchema = z.object({
  email: z.string().email()
});

function InviteForm({ onAdd, title }: InviteFormProps) {
  const [open, setOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(inviteFormSchema)
  });

  function onSubmit(value: z.infer<typeof inviteFormSchema>) {
    onAdd(value.email);
    setOpen(false);
    form.reset();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button>
          <Plus />
          <span>{title}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="rounded-xl rounded-tr-none w-96">

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2 items-end">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <div className="flex gap-3 items-end">
                    <FormLabel> Email </FormLabel>
                    <FormMessage className="leading-none" />
                  </div>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">
              Add
            </Button>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  );
}

interface RowProps {
  name: string,
  email: string;
  imageUrl?: string,
  onRemove?: () => any;
  onEdit?: () => any;
}

function Row({ imageUrl, name, onEdit, onRemove }: RowProps) {
  return (
    <div className="flex justify-between border-b p-4 pl-11">
      <div className="flex gap-6 items-center">
        <Avatar className="size-9">
          <AvatarImage src={imageUrl} />
          <AvatarFallback>
            <User className="size-5" />
          </AvatarFallback>
        </Avatar>
        <span>{name}</span>
      </div>
      <div className="flex gap-0.5">
        {onEdit &&
          <Button size="icon" variant="ghost" onClick={onEdit}>
            <Edit2 />
          </Button>
        }
        {onRemove &&
          <Button size="icon" variant="ghost" onClick={onRemove}>
            <Trash2 className="text-destructive" />
          </Button>
        }
      </div>
    </div>
  );
}

interface People {
  name: string,
  imageUrl?: string;
  email: string;
}

interface SharedSectionProps {
  // TODO: fix plural form of this and i18n
  title: string;
  onRemove?: (email: string) => any;
  onEdit?: (id: string) => any; // we dont have this
  // TODO: seperate endpoint???
  invite: (email: string) => any;
  peoples: (People)[];
  // TODO: access control
}

// shared by both instructors and teaching assistants
function SharedSection({ title, invite, peoples, onRemove }: SharedSectionProps) {
  return (
    <Collapsible defaultOpen>
      <div className="flex justify-between">
        <CollapsibleTrigger className="flex gap-3 items-center group">
          <ChevronDown className="group-data-[state=closed]:hidden" />
          <ChevronRight className="group-data-[state=open]:hidden" />
          <h2 className="text-xl font-medium"> {title}s ({peoples.length}) </h2>
        </CollapsibleTrigger>
        <InviteForm onAdd={invite} title={`Add ${title}`} />
      </div>
      <CollapsibleContent>
        <section className="mt-3">
          <div className="flex flex-col">
            {peoples.map(it => (
              <Row
                name={it.name}
                key={it.email}
                email={it.email}
                imageUrl={it.imageUrl}
                onRemove={onRemove ? (() => onRemove?.(it.email)) : undefined}
              />
            ))}
          </div>
        </section>
      </CollapsibleContent>
    </Collapsible>
  );
}

export interface InstructorAndTASectionProps {
  classId: number;
}

export function InstructorAndTASection({ classId }: InstructorAndTASectionProps) {
  const query = useSuspenseQuery({
    queryKey: ["class", classId, "instructors-and-tas"],
    // TODO: get student by class
    queryFn: () => api.instructorsAndTAs.listByClass(classId)
  });

  const [instructors, teachingAssistant] = useMemo(() => {
    return [
      query.data.instructors.map(it => ({ ...it, } satisfies People)),
      query.data.teachingAssistant.map(it => ({ ...it, } satisfies People))
    ];
  }, [query.data]);

  const inviteMutation = useMutation({
    mutationFn: (email: string) => api.instructorsAndTAs.addToClass(classId, email),
    onSuccess: (_, email) => {
      toast.success("Added " + email);
      query.refetch();
    },
    onError: (error, email) => {
      console.error(error);
      toast.error(`Error adding ${email}`, {
        description: error.message
      });
    }
  });


  return (
    <>
      <SharedSection
        title="Instructor"
        peoples={instructors}
        invite={(email) => inviteMutation.mutate(email)}
      />
      <SharedSection
        title="Teaching assistant"
        peoples={teachingAssistant}
        invite={(email) => inviteMutation.mutate(email)}
      />
    </>
  );
}