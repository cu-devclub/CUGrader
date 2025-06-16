'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { useSuspenseQuery } from "@tanstack/react-query"; // Changed from useQuery
import { Settings, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation"; // Import notFound
import { use, useEffect, useState } from "react";
import { ClassData, ClassDataProvider } from "./class-data-context"; // Import context

async function getClassDetails(classId: number): Promise<ClassData> {
  const target = await api.classes.getById(classId);
  if (!target) {
    notFound();
  }
  return {
    ...target,
    id: classId,
    name: target.courseName,
    semester: "1", // TODO: stop mock this after we have the api
    year: 2025,
    headerImageUrl: target.imageUrl,
    courseId: String(target.courseId)
  };
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


export default function Layout({
  children,
  params
}: LayoutProps) {
  const { class_id } = use(params);
  const prefix = `/instructor/class/${class_id}/`;
  // const scrollPosition = useScrollPosition();
  // const isAtTop = scrollPosition <= 54;
  // TODO: fix header later

  const classId = parseInt(class_id);

  const { data: classData } = useSuspenseQuery({
    queryKey: ["class", classId],
    queryFn: async () => {
      try {
        return await getClassDetails(classId);
      } catch (err) {
        console.error(err);
        notFound();
      }
    },
  });

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

      <ClassDataProvider data={classData}>
        {children}
      </ClassDataProvider>
    </div>
  );
}