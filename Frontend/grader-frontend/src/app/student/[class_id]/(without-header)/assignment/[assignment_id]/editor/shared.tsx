// TODO: language icon

import { LucideIcon, PlusIcon } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export interface CodeSpaceTabsProps<Id> {
  onSelect?: (id: Id) => unknown;
  onAdd?: () => unknown;
  selected?: Id;
  defaultSelected?: Id;
  tabs: ({
    id: Id;
    name: string;
    icon?: LucideIcon;
  })[];
  children?: ReactNode;
  className?: string;
}

export function CodeSpaceTabs({ tabs, onSelect, onAdd, selected, defaultSelected, children, className }: CodeSpaceTabsProps<string>) {
  const isControlled = selected !== undefined;

  return (
    <Tabs.Root
      value={isControlled ? selected : undefined}
      defaultValue={defaultSelected || tabs[0]?.id}
      onValueChange={onSelect}
      className={cn("flex flex-col", className)}
    >
      <Tabs.List className="text-xs border-b p-0.75 flex gap-1">
        {tabs.map(tab => (
          <Tabs.Trigger
            key={tab.id}
            value={tab.id}
            className="p-1 px-1.5 flex items-center gap-1.5 rounded data-[state=active]:bg-accent hover:bg-accent/50 transition-colors"
          >
            {tab.icon && <tab.icon className="size-3" />}
            {tab.name}
          </Tabs.Trigger>
        ))}
        {onAdd &&
          <button className="w-6 aspect-square flex items-center justify-center rounded hover:bg-accent" onClick={onAdd}>
            <PlusIcon className="size-3.5" />
          </button>
        }
      </Tabs.List>
      {children}
    </Tabs.Root>
  );
}

