'use client';

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { api } from "@/lib/api";
import { generateName } from "@/lib/api/mock";
import { ChevronDown, ChevronRight, Edit2, Plus, Trash2 } from "lucide-react";

interface SharedSectionProps {
  // TODO: fix plural form of this and i18n
  title: string;
  onRemove?: (id: string) => any;
  onEdit?: (id: string) => any;
}

// shared by both instructors and teaching assistants
function SharedSection({ title }: SharedSectionProps) {
  return (
    <Collapsible defaultOpen>
      <div className="flex justify-between">
        <CollapsibleTrigger className="flex gap-3 items-center group">
          <ChevronDown className="group-data-[state=closed]:hidden" />
          <ChevronRight className="group-data-[state=open]:hidden" />
          <h2 className="text-xl font-medium"> {title}s (2) </h2>
        </CollapsibleTrigger>
        <Popover>
          <PopoverTrigger asChild>
            <Button>
              <Plus />
              <span>Add {title}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="rounded-xl rounded-tr-none w-96 flex gap-2">
            <Input type="email" placeholder="Email" />
            <Button>
              Add
            </Button>
          </PopoverContent>
        </Popover>
      </div>
      <CollapsibleContent>
        <section className="mt-3">
          <div className="flex flex-col">
            <Row
              name={generateName()}
              imageUrl="dfjhui"
            />
          </div>
        </section>
      </CollapsibleContent>
    </Collapsible>
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
        <div className="rounded-full bg-primary size-9">
        </div>
        <span>{name}</span>
      </div>
      <div className="flex gap-0.5">
        <Button size="icon" variant="ghost">
          <Edit2 />
        </Button>
        <Button size="icon" variant="ghost">
          <Trash2 className="text-destructive" />
        </Button>
      </div>
    </div>
  );
}


export function InstructorSection() {
  return (
    <SharedSection
      title="Instructor"
    />
  );
}

export function TeachingAssistantSection() {
  return (
    <SharedSection
      title="Teaching assistant"
    />
  );
}
