import { EllipsisVertical, LucideIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";


type MenuItem = {
  title: string,
  icon: LucideIcon,
} & (
    {
      action: () => any;
    } | {
      href: string;
    }
  );

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

export interface ClassCardProps {
  name: string;
  courseId: number;
  semester: string;
  menuItems?: MenuItem[];
  headerImageUrl?: string;
  className?: string;
  href?: string;
}

export function ClassCard({ className, courseId, href, name, semester, headerImageUrl, menuItems }: ClassCardProps) {
  const content = (
    <Card className={cn("pt-0 pb-4 overflow-clip gap-2 hover:shadow-lg transition-shadow", className)}>
      <CardHeader className="bg-blue-500 h-28 p-0">
        {headerImageUrl}
      </CardHeader>
      <CardContent className="pl-4 pr-2">
        <div className="flex justify-between items-center h-9">
          <CardTitle>{name} ({semester})</CardTitle>
          {menuItems && <Menu items={menuItems} />}
        </div>
        <CardDescription>
          {courseId}
        </CardDescription>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href} className="hover:underline underline-offset-2"> {content}</Link > : content;
}
