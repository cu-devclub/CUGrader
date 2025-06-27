"use client";

import dayjs from "dayjs";
import { mockAssignmentsList } from "@/components/notification-popover";
import NotificationCard from "./notificationCard";
import { api } from "@/lib/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

export default function Page() {
  const NEAR_DUE_THERSHOLD = 3;
  let { data: AssignmentNearDue } = useSuspenseQuery({
    queryKey: ["notification-student"],
    queryFn: () => api.assignments.listNearDue(),
  });

  // Use mock data for testing
  AssignmentNearDue = mockAssignmentsList;

  // Filter assignments that are near due (within 3 days)
  const now = new Date();
  const threeDaysFromNow = new Date(
    now.getTime() + NEAR_DUE_THERSHOLD * 24 * 60 * 60 * 1000
  );
  AssignmentNearDue = AssignmentNearDue.filter((assignment) => {
    const dueDate = new Date(assignment.due.toString());
    return dueDate >= now && dueDate <= threeDaysFromNow;
  });

  // set notification created date to 3 days before due date
  const notificationsAssignmentNearDue = AssignmentNearDue.map((assignment) => {
    const dueDate = dayjs(assignment.due.toString());
    const notificationDate = dueDate.subtract(3, "day");
    const daysLeft = dueDate.diff(dayjs(), "day");
    let secondaryMessage;
    if (daysLeft === 0) {
      const hoursLeft = dueDate.diff(dayjs(), "hour");
      secondaryMessage = `Assignment due in ${hoursLeft} hours`;
    } else {
      secondaryMessage = `Assignment due in ${daysLeft} days`;
    }
    return {
      primaryMessage: assignment.name,
      secondaryMessage,
      type: "normal",
      ...assignment,
      notificationDate: notificationDate.toISOString(),
    };
  });

  const notificationsToShow = [...notificationsAssignmentNearDue].sort(
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
