import { LucideIcon, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

export interface FileCardProps {
  file: File;
  remove: () => any;
  icon: LucideIcon;
}

export function FileCard({ file, remove, icon }: FileCardProps) {
  const Icon = icon;
  return (
    <div className="border rounded-md bg-background p-3 flex gap-3 items-center">
      <div className="aspect-square">
        <div className="rounded-full bg-green-500/15 text-green-600 p-2">
          <Icon className="size-5" />
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