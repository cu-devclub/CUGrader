import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  className: string;
  classSem: string;
  classYear: string;
  courseId: string;
}

export default function layoutHeader({
  className,
  classSem,
  classYear,
  courseId,
}: Props) {
  return (
    <div className="w-full">
      <div className="h-60 relative">
        <div className="bg-blue-500 absolute inset-0"></div>
        <nav className="absolute z-30 top-6 right-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="size-10 rounded-full backdrop-blur-lg bg-black/15 hover:bg-black/15 text-white"
              >
                <Settings className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href="" className="">
                <DropdownMenuItem>
                  <Settings className="text-foreground" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem>
                <Trash2 className="text-destructive hover:text-destructive" />
                <span className="text-destructive hover:text-destructive">
                  Delete
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        <img
          src="./placeholder.png"
          alt="Class header image"
          className="absolute inset-0 object-cover h-full w-full"
        />
        <div className="absolute flex h-full items-center">
          <div className="bg-background p-8 py-5 pr-16 rounded-r-3xl leading-5">
            <h1 className="text-2xl font-medium">
              {" "}
              {className} ({classYear}/{classSem}){" "}
            </h1>
            <h2 className="text-primary"> {courseId} </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
