'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { api } from "@/lib/api";
import { generateName } from "@/lib/api/mock";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Edit2, Plus, Trash2, User } from "lucide-react";
import { useState } from "react";
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
  imageUrl: string,
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
        {onRemove &&
          <Button size="icon" variant="ghost">
            <Edit2 />
          </Button>
        }
        {onEdit &&
          <Button size="icon" variant="ghost">
            <Trash2 className="text-destructive" />
          </Button>
        }
      </div>
    </div>
  );
}

interface SharedSectionProps {
  // TODO: fix plural form of this and i18n
  title: string;
  onRemove?: (id: string) => any;
  onEdit?: (id: string) => any;
  invite: (email: string) => any;
  // TODO: access control
}

// shared by both instructors and teaching assistants
function SharedSection({ title, invite }: SharedSectionProps) {
  return (
    <Collapsible defaultOpen>
      <div className="flex justify-between">
        <CollapsibleTrigger className="flex gap-3 items-center group">
          <ChevronDown className="group-data-[state=closed]:hidden" />
          <ChevronRight className="group-data-[state=open]:hidden" />
          <h2 className="text-xl font-medium"> {title}s (2) </h2>
        </CollapsibleTrigger>
        <InviteForm onAdd={invite} title={`Add ${title}`} />
      </div>
      <CollapsibleContent>
        <section className="mt-3">
          <div className="flex flex-col">
            <Row
              name={generateName()}
              imageUrl="/TODO"
            />
          </div>
        </section>
      </CollapsibleContent>
    </Collapsible>
  );
}

export interface InstructorSectionProps {
  classId: number;
}

export function InstructorSection({ classId }: InstructorSectionProps) {
  const inviteMutation = useMutation({
    mutationFn: async (email: string) => {
      console.log("Unimplemented");
    },
    onSuccess: (_, email) => toast.success("Added " + email),
    onError: (error, email) => {
      console.error(error);
      toast.error(`Error adding ${email}`, {
        description: error.message
      });
    }
  });
  return (
    <SharedSection
      title="Instructor"
      invite={(email) => inviteMutation.mutate(email)}
    />
  );
}

export interface TeachingAssistantSectionProps {
  classId: number;
}

export function TeachingAssistantSection({ classId }: TeachingAssistantSectionProps) {
  const inviteMutation = useMutation({
    mutationFn: (email: string) => api.instructorsAndTAs.addToClass(classId, email),
    onSuccess: (_, email) => toast.success("Added " + email),
    onError: (error, email) => {
      console.error(error);
      toast.error(`Error adding ${email}`, {
        description: error.message
      });
    }
  });

  return (
    <SharedSection
      title="Teaching assistant"
      invite={(email) => inviteMutation.mutate(email)}
    />
  );
}
