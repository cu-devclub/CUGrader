"use client";

import NotificationCard from "./notificationCard";
import { api } from "@/lib/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

export default function page() {
  const { data: assigmentsList } = useSuspenseQuery({
    queryKey: ["notification-student"],
    queryFn: () => api.assignments.listNearDue(),
  });

  const t = useTranslations("notification-page");

  console.log(JSON.stringify(assigmentsList, null, 2));

  const ass = assigmentsList[0];

  return (
    <div className="flex min-h-screen">
      <div className="w-full border-gray-300 flex flex-col items-center">
        <div className="w-full h-full p-4">
          <div className="flex border-b mb-4 px-10 h-12">
            <h1 className="text-2xl">{t("noti-title")}</h1>
          </div>
          <div className="w-full h-full px-30">
            <div className="mb-1">
              <h1>{t("notification")}</h1>
            </div>
            <div className="flex flex-col item-center gap-y-2 border border-solid h-full p-2">
              {assigmentsList.map((assign, index) => (
                <NotificationCard
                  key={index}
                  labName={assign.name}
                  courseName={assign.courseName}
                  due={assign.due
                    .toString()
                    .replace("T09:", " ")
                    .replaceAll("-", "/")}
                  maxScore={assign.maxScore}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
