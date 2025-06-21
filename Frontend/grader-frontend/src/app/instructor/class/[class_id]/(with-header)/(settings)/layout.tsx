'use client';

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users } from "lucide-react";
import { useClassData } from "../../class-data-context";
import Link from "next/link";
import { useActiveTab } from "../../use-active-tab";

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
      </Tabs>

      <div className="mt-6">
        {children}
      </div>
    </main >
  );
}