import React from "react";
import { Inbox, Check, X } from "lucide-react";

interface NotificationCardProps {
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

export default function NotificationCard({
  primaryMessage,
  notificationDate,
  type = "normal",
  courseId,
  secondaryMessage = "General notification detail",
}: NotificationCardProps) {
  return (
    <div className="flex flex-col border rounded-lg bg-white px-4 py-3 w-full shadow-sm">
      <div className="flex justify-between items-start mb-1">
        <span className="text-pink-500 text-sm font-medium leading-none">
          {courseId}
        </span>
        <span className="text-xs text-muted-foreground mt-0.5">
          {notificationDate}
        </span>
      </div>
      <div className="flex items-start">
        {iconMap[type]}
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-base text-gray-900 leading-tight truncate max-w-[220px]">
            {primaryMessage}
          </span>
          <span className="text-sm text-muted-foreground truncate max-w-[220px]">
            {secondaryMessage}
          </span>
        </div>
      </div>
    </div>
  );
}
