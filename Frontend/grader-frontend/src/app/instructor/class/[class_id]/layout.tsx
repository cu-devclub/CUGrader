'use client';

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ClipboardList, FileText, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { use, useEffect, useState } from "react";

function useActiveTab() {
  const path = usePathname();
  if (path.endsWith("assignments")) {
    return "assignments";
  }
  if (path.endsWith("people")) {
    return "people";
  }
  if (path.endsWith("exam-mode")) {
    return "exam-mode";
  }

  return null;
}

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
  params: Promise<{ class_id: string; }>;
}

export default function Layout({
  children,
  params
}: LayoutProps) {
  const { class_id } = use(params);
  const prefix = `/instructor/class/${class_id}/`;

  const scrollPosition = useScrollPosition();
  const isAtTop = scrollPosition <= 54;
  const activeTab = useActiveTab();

  return (
    <div>
      <div className="h-60 relative">
        <div className="bg-blue-500 absolute inset-0">
          some bg
        </div>
        <div className="absolute flex h-full items-center">
          <div className="bg-background p-8 py-5 pr-16 rounded-r-3xl leading-5">
            <h1 className="text-2xl font-medium"> Class name (2024/1) </h1>
            <h2 className="text-primary"> 2302348 </h2>
          </div>
        </div>
      </div>

      <nav className={cn("fixed top-0 flex w-full justify-between items-center transition-all border-b border-transparent", isAtTop ? "p-6" : "p-2 bg-background border-border shadow-xs")}>
        <div className={cn("ml-4 leading-4 text-sm", isAtTop && "opacity-0")}>
          <h1 className="font-medium"> Class name (2024/1) </h1>
          <h2 className="text-primary"> 2302348 </h2>
        </div>
        <Button
          variant="secondary"
          size="icon"
          className={cn("size-10 rounded-full", isAtTop ? "bg-black/10 hover:bg-black/15 text-white" : "bg-black/5 hover:bg-black/10")}>
          <Settings className="size-5" />
        </Button>
      </nav>

      <main className="max-w-4xl px-8 mt-4 mb-16 mx-auto ">
        <Tabs value={activeTab ?? undefined}>
          <TabsList className="w-full grid-cols-4">
            <TabsTrigger value="assignments" asChild>
              <Link href={prefix + "assignments"} className="flex flex-1 items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Assignments</span>
              </Link>
            </TabsTrigger>
            <TabsTrigger value="people" asChild>
              <Link href={prefix + "people"} className="flex flex-1 items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>People</span>
              </Link>
            </TabsTrigger>
            <TabsTrigger value="exam-mode" asChild>
              <Link href={prefix + "exam-mode"} className="flex flex-1 items-center space-x-2">
                <ClipboardList className="w-4 h-4" />
                <span>Exam mode</span>
              </Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="mt-6">
          {children}
        </div>
      </main>
    </div>
  );
}