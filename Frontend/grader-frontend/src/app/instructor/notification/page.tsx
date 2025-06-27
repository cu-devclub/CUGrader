"use client";

import dayjs from "dayjs";
import { mockAssignmentsList } from "@/components/notification-popover";
import NotificationCard from "../../../components/notificationCard";
import { api } from "@/lib/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

export default function Page() {
  // Mock notification data for instructor
  const notificationsToShow = [
    {
      primaryMessage: "Assignment graded",
      notificationDate: dayjs().format("DD MMM YY"),
      type: "success",
      courseId: "2301101",
      secondaryMessage: "Lab 1: Introduction to React graded successfully.",
    },
    {
      primaryMessage: "Assignment submission error",
      notificationDate: dayjs().subtract(1, "day").format("DD MMM YY"),
      type: "error",
      courseId: "2301102",
      secondaryMessage: "Lab 2: State Management submission failed.",
    },
    {
      primaryMessage: "Upcoming project deadline",
      notificationDate: dayjs().add(2, "day").format("DD MMM YY"),
      type: "normal",
      courseId: "2303105",
      secondaryMessage: "Project Proposal due in 2 days.",
    },
  ].sort(
    (a, b) => {
      const aDate = dayjs(a.notificationDate);
      const bDate = dayjs(b.notificationDate);
      return aDate.valueOf() - bDate.valueOf();
    }
  );

  const t = useTranslations("notification-page");

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
              {notificationsToShow.map((assign, index) => (
                <NotificationCard
                  key={index}
                  primaryMessage={assign.primaryMessage}
                  notificationDate={dayjs(assign.notificationDate).format(
                    "DD MMM YY"
                  )}
                  type={
                    assign.type === "success" || assign.type === "error"
                      ? assign.type
                      : "normal"
                  }
                  courseId={assign.courseId?.toString()}
                  secondaryMessage={assign.secondaryMessage}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
