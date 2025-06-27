"use client";

import { Bell } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { NotificationMiniCard } from "@/components/notification-mini-card";
import { Button } from "@/components/ui/button";
import { CalendarDateTime, parseDateTime } from "@internationalized/date";
import dayjs from "dayjs";

export type NearDueAssignment = {
    id: number;
    name: string;
    maxScore: number;
    due: CalendarDateTime;
    courseName: string;
    courseId: string;
};
// Remove trailing Z for parseDateTime compatibility
const MOCKONLY_NowDateTime = parseDateTime(new Date().toISOString().replace('Z', ''))
export const mockAssignmentsList: NearDueAssignment[] = [
    {
        id: 1,
        name: "Lab 1: Introduction to React",
        maxScore: 100,
        due: MOCKONLY_NowDateTime.add({ days: 2 }), // due in 2 days
        courseName: "Web Programming 101",
        courseId: "2301101",
    },
    {
        id: 2,
        name: "Lab 2: State Management",
        maxScore: 100,
        due: MOCKONLY_NowDateTime.add({ days: 1 }), // due tomorrow
        courseName: "Web Programming 101",
        courseId: "2301102",
    },
    {
        id: 3,
        name: "Project Proposal",
        maxScore: 50,
        due: MOCKONLY_NowDateTime.add({ hours: 12 }), // due in 12 hours
        courseName: "Software Engineering",
        courseId: "2303105",
    },
];

export function NotificationPopover() {
    const NEAR_DUE_THERSHOLD = 3; // days - if assignment is due within X days, it will be notified 

    // Fetch assignments that are near due
    let { data: AssignmentNearDue } = useSuspenseQuery({
        queryKey: ["notification-student"],
        queryFn: () => api.assignments.listNearDue(),
    });

    /* ------------------------
     USE MOCK DATA FOR TESTING - Comment below line to use real data
    ---------------------------*/
    AssignmentNearDue = mockAssignmentsList; // Use mock data for testing

    // Filter assignments that are near due (within 3 days)
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + NEAR_DUE_THERSHOLD * 24 * 60 * 60 * 1000); // 3 days in milliseconds
    AssignmentNearDue = AssignmentNearDue.filter(
        (assignment) => {
            // Assume assignment.due is CalendarDateTime and has toString() returning ISO or parseable string
            const dueDate = new Date(assignment.due.toString());
            return dueDate >= now && dueDate <= threeDaysFromNow;
        }
    );

    // set notification created date to 3 days before due date
    const notificationsAssignmentNearDue = AssignmentNearDue.map((assignment) => {
        const dueDate = dayjs(assignment.due.toString());
        const notificationDate = dueDate.subtract(3, "day");
        const daysLeft = dueDate.diff(dayjs(), "day");
        let secondaryMessage;
        // If due today, show hours left
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
            notificationDate: notificationDate.toISOString(), // dayjs object
        };
    });


    // combine notifications and sort them by date
    const notificationsToShow = [
        ...notificationsAssignmentNearDue,
        //add other notification types here if needed
    ].sort((a, b) => {
        const aDate = dayjs(a.notificationDate);
        const bDate = dayjs(b.notificationDate);
        return aDate.valueOf() - bDate.valueOf();
    });


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
                                primaryMessage={assign.primaryMessage}
                                notificationDate={dayjs(assign.notificationDate).format("DD MMM YY")}
                                type={assign.type === "success" || assign.type === "error" ? assign.type : "normal"} // default to normal if not specified
                                courseId={assign.courseId?.toString()}
                                secondaryMessage={assign.secondaryMessage}
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
