'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useClassData } from "../class-data-context"; // Import context

function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = () => {
    const position = window.pageYOffset;
    setScrollPosition(position);
  };

  useEffect(() => {
    setScrollPosition(window.pageYOffset);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  return scrollPosition;
}

interface LayoutProps {
  children: React.ReactNode;
}


export default function Layout({
  children,
}: LayoutProps) {
  const { classData } = useClassData();
  const prefix = `/instructor/class/${classData.id}/`;

  return (
    <div>
      <div className="h-60 relative">
        <div className="bg-blue-500 absolute inset-0">
        </div>
        <nav className="absolute z-30 top-6 right-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="size-10 rounded-full backdrop-blur-lg bg-black/15 hover:bg-black/15 text-white">
                <Settings className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href={prefix + "settings"} className="">
                <DropdownMenuItem>
                  <Settings className="text-foreground" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem>
                <Trash2 className="text-destructive hover:text-destructive" />
                <span className="text-destructive hover:text-destructive">Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </nav>
        <img src={classData.headerImageUrl} alt="Class header image" className="absolute inset-0 object-cover h-full w-full" />
        <div className="absolute flex h-full items-center">
          <div className="bg-background p-8 py-5 pr-16 rounded-r-3xl leading-5">
            <h1 className="text-2xl font-medium"> {classData?.name} ({classData?.year}/{classData?.semester}) </h1>
            <h2 className="text-primary"> {classData?.courseId} </h2>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}