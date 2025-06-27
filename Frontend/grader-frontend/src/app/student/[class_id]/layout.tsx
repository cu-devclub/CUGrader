"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import clsx from "clsx";
import { ChartNoAxesColumn, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { api } from "@/lib/api";
import { notFound } from "next/navigation";

import LayoutHeader from "./layoutHeader";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

interface ClassData {
  id: number;
  name: string;
  courseId: string;
  year: number;
  semester: string;
  headerImageUrl?: string;
}

// async function getClassDetails(classId: number): Promise<ClassData> {
//   const target = await api.classes.getById(classId);
//   if (!target) {
//     notFound();
//   }
//   return {
//     // ...target,
//     id: classId,
//     name: target.courseName,
//     semester: "1",
//     year: 2025,
//     headerImageUrl: target.imageUrl,
//     courseId: String(target.courseId),
//   };
// }

export default function StudentLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const classId = parseInt(params.class_id as string);

  const t = useTranslations("student");

  const classInfoQuery = useSuspenseQuery({
    queryKey: ["classInfo", classId],
    queryFn: async () => {
      try {
        return await api.classes.getById(classId);
      } catch (e) {
        console.error("Class not found:", e);
        // Mock Data -> api.class.getById cannot fetch data
        return {
          // ...target,
          id: classId,
          name: "Programming",
          semester: "1",
          year: 2025,
          headerImageUrl: "Image.url",
          courseId: "1",
        };
      }
    },
  });

  // const classInfoQuery = useSuspenseQuery({
  //   queryKey: ["classInfo"],
  //   queryFn: async () => {
  //     try {
  //       return await getClassDetails(classId);
  //     } catch (err) {
  //       console.error(err);
  //       notFound();
  //     }
  //   },
  // });

  // console.log(JSON.stringify(classInfoQuery, null, 2));

  return (
    <div className="flex min-h-screen">
      <div className="w-full border-gray-300 flex flex-col items-center">
        <LayoutHeader
          className="Programming"
          classYear="2025"
          classSem="1"
          courseId="1"
        />
        <div className="w-full h-full p-4 mx-100">
          <div className="flex border-b mb-4 px-5 mx-60">
            <Tabs>
              <TabsList className="w-full grid-cols-4 space-x-10">
                <TabsTrigger value="Assignment" asChild>
                  <Link
                    href={`./assignment`}
                    className={clsx(
                      "pb-2 px-4 font-semibold border-b-2",
                      pathname.includes("assignment")
                        ? "border-b-2 border-pink-500 text-pink-600"
                        : "text-gray-500 hover:text-pink-500"
                    )}
                  >
                    <FileText className="w-4 h-4" />
                    {t("assignment")}
                  </Link>
                </TabsTrigger>

                <TabsTrigger value="Profile" asChild>
                  <Link
                    href={`./profile`}
                    className={clsx(
                      "pb-2 px-4 font-semibold border-b-2",
                      pathname.includes("profile")
                        ? "border-b-2 border-pink-500 text-pink-600"
                        : "text-gray-500 hover:text-pink-500"
                    )}
                  >
                    <ChartNoAxesColumn className="w-4 h-4" />
                    {t("profile-text")}
                  </Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="mx-60 flex justify-center">{children}</div>
        </div>
      </div>
    </div>
  );
}
