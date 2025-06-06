import { EllipsisVertical, LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface MenuItem {
  title: string,
  icon: LucideIcon,
  action: () => unknown;
}

interface MenuProps {
  items: MenuItem[];
}

function Menu({ items }: MenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

  );
}

interface ClassCardProps {

}

export function ClassCard({  }: ClassCardProps) {
  return (
    <Card className="pt-0 overflow-clip gap-2">
      <CardHeader className="bg-blue-400 h-28 p-0">
        some image
      </CardHeader>
      <CardContent className="pl-4 pr-2">
        <div className="flex justify-between items-center">
          <CardTitle>Class name (2024/1)</CardTitle>
          <Menu items={[]} />
        </div>
        <CardDescription>
          230xxxx
        </CardDescription>
      </CardContent>
    </Card>
  );
}
