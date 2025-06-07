"use client";

import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";

interface Props {
  id: number;
  class_id: number;
  class_name: string;
  image: string;
  semester: string;
}

function studentCard({ class_id, class_name, image, semester }: Props) {
  const [progress, setProgress] = React.useState(13);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(70), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Card className="w-60 h-40 bg-gray-300 p-0 m-0 overflow-hidden relative">
        <div className="h-full w-full">
          <div className="flex h-[45%] w-full m-0 p-0 items-center justify-center border border-solid bg-white">
            IMAGE HERE
          </div>
          <div className="flex h-[55%] w-full m-0 p-0 flex-col bg-gray-300">
            <div className="flex justify-between items-end min-w-full space-x-5 px-4 pt-2">
              <h1 className="text-md">{class_name}</h1>
              <h1 className="text-emerald-400 text-lg">{semester}</h1>
            </div>

            <div className="px-3 flex flex-col gap-y-3">
              <p className="text-xs text-gray-400">{class_id}</p>
              <Progress value={progress} className="h-3 w-[90%]" />
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}

export default studentCard;
