"use client";

import * as React from "react";
import { Progress } from "@/components/ui/progress";

function studentCard() {
  const [progress, setProgress] = React.useState(13);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(70), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="w-60 h-40 shadow rounded bg-white flex-col">
        <div className="flex border border-solid min-h-4/10 min-w-full">
          IMAGE HERE
        </div>

        <div className="flex border border-solid min-h-6/10 min-w-full flex-col bg-gray-300">
          <div className="flex justify-between border border-solid min-w-full px-3 py-2 items-center">
            <h1 className="text-md">Class name (Sec 1)</h1>
          </div>
          <div className="px-3 flex flex-col gap-y-3">
            <p className="text-xs text-gray-400">230xxx</p>
            <Progress value={progress} className="h-3 w-[90%]" />
          </div>
        </div>
      </div>
    </>
  );
}

export default studentCard;
