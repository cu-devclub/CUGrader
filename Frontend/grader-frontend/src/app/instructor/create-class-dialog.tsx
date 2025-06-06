import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogClose } from "@radix-ui/react-dialog";
import { EllipsisVertical, Plus } from "lucide-react";

interface CreateClassDialogProps {

}

// TODO: get that shade of pink
export function CreateClassDialog({ }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Class</DialogTitle>
          <div className="mt-2">
            <h3 className="font-semibold"> Class Info </h3>
            <hr className="mt-0.5" />
            <div className="space-y-3 mt-3">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="class-name" className="font-normal">Class name</Label>
                <Input id="class-name" placeholder="Class name" />
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="class-id" className="font-normal">Class ID</Label>
                <Input id="class-id" placeholder="2301111" />
              </div>

              <div className="grid w-full items-center gap-2">
                <Label htmlFor="class-name" className="font-normal">Class name</Label>
                <Input id="class-name" placeholder="Class name" />
              </div>
            </div>
          </div>
          <div className="mt-2">
            <h3 className="font-semibold"> Add Students <span className="font-normal text-pink-300">(Optional)</span> </h3>
            <hr className="mt-0.5" />
          </div>
          <div className="mt-2">
            <h3 className="font-semibold"> Class Picture <span className="font-normal text-pink-300">(Optional)</span></h3>
            <hr className="mt-0.5" />
          </div>
        </DialogHeader>
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
