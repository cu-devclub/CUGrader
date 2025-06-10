"use client";

import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface Props {
  id: number;
  class_id: number;
  class_name: string;
  image: string;
  semester: string;
}

function studentCard({ class_id, class_name, image, semester }: Props) {
  const router = useRouter();

  const toAssignmentPage = () => {
    router.push(
      `/student/${class_id}/${semester.replace("/", "-")}/1/assignment`
    );
  };

  const [progress, setProgress] = React.useState(13);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(70), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Card
        className="w-80 h-50 p-0 m-0 overflow-hidden relative"
        onClick={() => toAssignmentPage()}
      >
        <div className="h-full w-full">
          <div className="flex h-[45%] w-full m-0 p-0 items-center justify-center border border-solid bg-blue-500 overflow-hidden">
            {image ? (
              <img
                src={image}
                alt=""
                className="h-full w-full object-cover border border-solid"
              />
            ) : (
              <div className="h-full w-full object-cover border border-solid"></div>
            )}
          </div>
          <div className="flex h-[55%] w-full m-0 p-0 flex-col">
            <div className="flex items-end min-w-full space-x-5 px-4 pt-2">
              <h1 className="text-md py-1 font-bold">
                {class_name} ({semester})
              </h1>
            </div>

            <div className="px-4 flex flex-col gap-y-3">
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
