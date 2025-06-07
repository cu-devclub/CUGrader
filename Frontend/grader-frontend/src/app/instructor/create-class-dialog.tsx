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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";

interface CreateClassDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateClassDialog({ open, onOpenChange }: CreateClassDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-primary text-xl">Create Class</DialogTitle>
          <DialogDescription>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <h3 className="font-medium"> Class Info </h3>
          <hr className="mt-2" />
          <div className="space-y-4 mt-4">
            <div className="grid w-full items-center gap-2">
              <Label className="font-normal" htmlFor="class-name">Class name</Label>
              <Input id="class-name" placeholder="Data structures and Algorithms" />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label className="font-normal" htmlFor="class-id">Class ID</Label>
              <Input id="class-id" placeholder="2301111" />
            </div>
            <div className="grid w-full items-center gap-2">
              <Label className="font-normal" htmlFor="class-name">Academic Year/Semester</Label>
              {/* TODO: get current semester */}
              <Input id="class-name" placeholder="2025/1" />
            </div>
          </div>
        </div>

        <Collapsible
          className="flex flex-col gap-2"
        >
          <div className="flex items-center justify-between gap-4 ">
            <h3 className="font-medium"> Add Students <span className="font-normal text-primary/50">(Optional)</span> </h3>
            <CollapsibleTrigger asChild>
              {/* TODO: make clickable area bigger */}
              <Button variant="ghost" size="icon" className="size-7">
                <ChevronRight />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <hr />
          <CollapsibleContent className="flex flex-col gap-2">
            TODO: File Upload
          </CollapsibleContent>
        </Collapsible>

        <Collapsible
          className="flex flex-col gap-2"
        >
          <div className="flex items-center justify-between gap-4 ">
            <h3 className="font-medium"> Class Picture <span className="font-normal text-primary/50">(Optional)</span> </h3>
            <CollapsibleTrigger asChild>
              {/* TODO: make clickable area bigger */}
              <Button variant="ghost" size="icon" className="size-7">
                <ChevronRight />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <hr />
          <CollapsibleContent className="flex flex-col gap-2">
            TODO: File Upload
          </CollapsibleContent>
        </Collapsible>
        <DialogFooter >
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button">
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
