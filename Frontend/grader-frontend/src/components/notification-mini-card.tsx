"use client";

import React from "react";

interface NotificationMiniCardProps {
  labName: string;
  courseName: string;
  due: string;
  maxScore: number;
}

export function NotificationMiniCard({ labName, courseName, due, maxScore }: NotificationMiniCardProps) {
  return (
    <div className="flex flex-col px-2 py-1 border rounded bg-muted/50">
      <div className="flex justify-between items-center">
        <span className="font-medium text-sm truncate max-w-[120px]">{labName}</span>
        <span className="text-xs text-muted-foreground ml-2">{due}</span>
      </div>
      <div className="flex justify-between items-center mt-0.5">
        <span className="text-xs text-muted-foreground truncate max-w-[100px]">{courseName}</span>
        <span className="text-xs font-semibold text-primary ml-2">{maxScore} pts</span>
      </div>
    </div>
  );
}
