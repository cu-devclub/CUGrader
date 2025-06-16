'use client';

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { useClassData } from "../class-data-context";
import Link from "next/link";

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
            <TabsTrigger value="settings" asChild>
              <Link href={prefix + "settings"} className="flex px-6 items-center gap-2">
                <Settings className="size-4" />
                <span>Setting</span>
              </Link>
            </TabsTrigger>
            <TabsTrigger value="teacher-management" asChild>
              <Link href={prefix + "teacher-management"} className="flex px-6 items-center gap-2">
                <Users className="size-4" />
                <span>Teacher Management</span>
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