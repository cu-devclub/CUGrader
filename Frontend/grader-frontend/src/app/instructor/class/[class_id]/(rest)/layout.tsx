'use client';

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, FileText, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClassData } from "../class-data-context";

const pages = [
  "assignments",
  "people",
  "exam-mode",
  "settings",
  "teacher-management"
] as const;

function useActiveTab() {
  const path = usePathname();
  for (const page of pages) {
    if (path.endsWith(page)) {
      return page;
    }
  }

  return null;
}


interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { classData: { id } } = useClassData();
  const prefix = `/instructor/class/${id}/`;
  const activeTab = useActiveTab();

  return (
    <main className="max-w-4xl px-8 mt-4 mb-16 mx-auto ">
      <Tabs value={activeTab ?? undefined}>
        <div className="relative">
          <hr className="absolute bottom-[1px] z-0 w-full border" />
          <TabsList className="relative">
            <TabsTrigger value="assignments" asChild>
              <Link href={prefix + "assignments"} className="flex px-6 items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Assignments</span>
              </Link>
            </TabsTrigger>
            <TabsTrigger value="people" asChild>
              <Link href={prefix + "people"} className="flex px-6 items-center gap-2">
                <Users className="w-4 h-4" />
                <span>People</span>
              </Link>
            </TabsTrigger>
            <TabsTrigger value="exam-mode" asChild>
              <Link href={prefix + "exam-mode"} className="flex px-6 items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                <span>Exam mode</span>
              </Link>
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
      <div className="mt-6">
        {children}
      </div>
    </main>
  );
}