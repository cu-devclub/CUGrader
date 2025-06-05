import React from "react";
import { Card } from "@/components/ui/card";

export default function page() {
  return (
    <div className="flex min-h-screen">
      <div className="w-16 border border-solid border-gray-300 flex flex-col items-center"></div>

      <div className="flex-1 flex-col">
        <div className="flex h-16 border border-solid"></div>

        <div className="flex flex-col px-24">
          <div className="flex h-16 border border-solid p-4">
            <h1 className="text-2xl font-bold">TA</h1>
          </div>
          <div></div>
        </div>

        <div className="flex flex-col">
          <div className="flex h-16 border border-solid"></div>
          <div></div>
        </div>
      </div>
    </div>
  );
}
