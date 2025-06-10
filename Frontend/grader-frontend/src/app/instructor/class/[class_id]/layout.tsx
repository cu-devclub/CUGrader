'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ClipboardList, FileText, Settings, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, notFound } from "next/navigation"; // Import notFound
import { use, useEffect, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query"; // Changed from useQuery
import { ClassDataProvider, ClassData } from "./class-data-context"; // Import context
import { api } from "@/lib/api";
// import { api } from "@/lib/api"; // Assuming your api client is here - replace if different

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
  if (path.endsWith("settings")) {
    return "settings";
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
  params: Promise<{ class_id: string; }>; // Corrected: params is a Promise
}

async function getClassDetails(classId: number): Promise<ClassData> {
  // TODO: new api for this
  const classes = await api.classes.listParticipatingBySemester("2025/1");
  const target = classes.assisting.find(it => it.classId === classId);
  if (!target) {
    notFound();
  }
  return {
    ...target,
    id: String(classId),
    name: target.courseName,
    semester: 1,
    year: 2025,
    headerImageUrl: target.imageUrl,
    courseId: String(target.courseId)
  };
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

  const { data: classData } = useSuspenseQuery({
    queryKey: ["class", class_id],
    queryFn: async () => {
      try {
        const classId = parseInt(class_id);
        return await getClassDetails(classId);
      } catch (err) {
        console.error(err);
        notFound();
      }
    },
  });


  return (
    <ClassDataProvider data={classData}>
      <div>
        <div className="h-60 relative">
          <div className="bg-blue-500 absolute inset-0">
            {/* Potentially use classData here for background image if available */}
            {/* e.g., classData?.headerImageUrl ? <img src={classData.headerImageUrl} /> : "some bg" */}
            some bg
          </div>
          <div className="absolute flex h-full items-center">
            <div className="bg-background p-8 py-5 pr-16 rounded-r-3xl leading-5">
              <h1 className="text-2xl font-medium"> {classData?.name} ({classData?.year}/{classData?.semester}) </h1>
              <h2 className="text-primary"> {classData?.courseId} </h2>
            </div>
          </div>
        </div>

        <nav className={cn("fixed z-30 top-0 flex w-full justify-between items-center transition-all border-b border-transparent", isAtTop ? "p-6" : "p-2 bg-background border-border shadow-xs")}>
          <div className={cn("ml-4 leading-4 text-sm", isAtTop && "opacity-0")}>
            <h1 className="font-medium"> {classData?.name} ({classData?.year}/{classData?.semester}) </h1>
            <h2 className="text-primary"> {classData?.courseId} </h2>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className={cn("size-10 rounded-full backdrop-blur-xl", isAtTop ? "bg-black/10 hover:bg-black/15 text-white" : "bg-black/5 hover:bg-black/10")}>
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
              <TabsTrigger value="settings" asChild>
                <Link href={prefix + "settings"} className="flex flex-1 items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="mt-6">
            {children}
          </div>
        </main>
      </div>
    </ClassDataProvider>
  );
}