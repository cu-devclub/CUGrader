"use client";

import React from "react";
import { Inbox, Check, X } from "lucide-react";
import { toast } from "sonner";

interface NotificationMiniCardProps {
    primaryMessage: string;
    notificationDate: string;
    type?: "normal" | "success" | "error"; // default is "normal"
    courseId?: string; // for the pink courseId at the top left
    secondaryMessage?: string; // for the detail under the title
}

const iconMap = {
    normal: (
        <span className="flex items-center justify-center rounded bg-muted p-1 mr-3 mt-1">
            <Inbox className="w-6 h-6 text-muted-foreground" />
        </span>
    ),
    success: (
        <span className="flex items-center justify-center rounded bg-green-100 p-1 mr-3 mt-1">
            <Check className="w-6 h-6 text-green-600" />
        </span>
    ),
    error: (
        <span className="flex items-center justify-center rounded bg-red-100 p-1 mr-3 mt-1">
            <X className="w-6 h-6 text-red-600" />
        </span>
    ),
};

export function NotificationMiniCard({
    primaryMessage,
    notificationDate,
    type = "normal",
    courseId,
    secondaryMessage = "General notification detail",
}: NotificationMiniCardProps) {
    const handleClick = () => {
      toast.success("Go to")
    }
    return (
        <div onClick={handleClick} className="flex flex-col cursor-pointer *:select-none border rounded-lg bg-white px-4 py-3 w-full shadow-sm">
            <div className="flex justify-between items-start mb-1">
                <span className="text-pink-500 text-sm font-medium leading-none">{courseId}</span>
                <span className="text-xs text-muted-foreground mt-0.5">{notificationDate}</span>
            </div>
            <div className="flex items-start">
                {iconMap[type]}
                <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-base text-gray-900 leading-tight truncate max-w-[220px]">{primaryMessage}</span>
                    <span className="text-sm text-muted-foreground truncate max-w-[220px]">{secondaryMessage}</span>
                </div>
            </div>
        </div>
    );
}

// For popover mock data
export type CalendarDateTime = {
  toString: () => string;
};

export type NearDueAssignment = {
  id: number;
  name: string;
  maxScore: number;
  due: CalendarDateTime;
  courseName: string;
  courseId: string;
};

export const mockAssignmentsList: NearDueAssignment[] = [
  {
    id: 1,
    name: "Lab 1: Introduction to React",
    maxScore: 100,
    due: { toString: () => new Date().toISOString() },
    courseName: "Web Programming 101",
    courseId: "2301101",
  },
  {
    id: 2,
    name: "Lab 2: State Management",
    maxScore: 100,
    due: { toString: () => new Date(Date.now() + 86400000).toISOString() },
    courseName: "Web Programming 101",
    courseId: "2301102",
  },
  {
    id: 3,
    name: "Project Proposal",
    maxScore: 50,
    due: { toString: () => new Date(Date.now() + 3 * 86400000).toISOString() },
    courseName: "Software Engineering",
    courseId: "2303105",
  },
];
