'use client';

import { api } from "@/lib/api";
import { useSuspenseQuery } from "@tanstack/react-query"; // Changed from useQuery
import { notFound } from "next/navigation"; // Import notFound
import { use } from "react";
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


interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ class_id: string; }>;
}


export default function Layout({
  children,
  params
}: LayoutProps) {
  const { class_id } = use(params);

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
    <ClassDataProvider data={classData}>
      {children}
    </ClassDataProvider>
  );
}