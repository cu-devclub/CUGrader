"use client";

import { Bell } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { NotificationMiniCard } from "@/components/notification-mini-card";
import { Button } from "@/components/ui/button";

export function NotificationPopover() {
  // Mock data for assignments
  const mockAssignmentsList = [
    {
      name: "Lab 1: Introduction to React",
      courseName: "Web Programming 101",
      due: new Date().toISOString(),
      maxScore: 100,
    },
    {
      name: "Lab 2: State Management",
      courseName: "Web Programming 101",
      due: new Date(Date.now() + 86400000).toISOString(),
      maxScore: 100,
    },
    {
      name: "Project Proposal",
      courseName: "Software Engineering",
      due: new Date(Date.now() + 3 * 86400000).toISOString(),
      maxScore: 50,
    },
  ];

  const { data: notifications } = useSuspenseQuery({
    queryKey: ["notification-student"],
    queryFn: () => api.assignments.listNearDue(),
  });

  const notificationsToShow =
    notifications && notifications.length > 0 ? notifications : mockAssignmentsList;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="text-xl relative">
          <Bell className="h-5 w-5" />
          {notificationsToShow?.length > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
              {notificationsToShow.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4">
        <div className="font-bold mb-2 text-base">Notifications</div>
        <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
          {notificationsToShow && notificationsToShow.length > 0 ? (
            notificationsToShow.map((assign, idx) => (
              <NotificationMiniCard
                key={idx}
                labName={assign.name}
                courseName={assign.courseName}
                due={assign.due
                  .toString()
                  .replace("T09:", " ")
                  .replaceAll("-", "/")}
                maxScore={assign.maxScore}
              />
            ))
          ) : (
            <div className="text-sm text-muted-foreground">No notifications</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
