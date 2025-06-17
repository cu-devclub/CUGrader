"use client";

import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  id: number;
  class_id: string;
  class_name: string;
  image?: string;
  semester: string;
}

function statPopOver() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <FileText />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        className="ml-2 mb-8 w-60 h-50 overflow-hidden relative flex-col"
      >
        <div>
          <h1 className="font-bold text-md">Assigned</h1>
        </div>
        <div className="flex flex-col w-full">
          <div className="flex justify-between border-b pb-1 mt-1">
            <div className="flex flex-col gap-y-1">
              <h1 className="text-md">Assignment 1</h1>
              <span className="text-xs text-primary">Due: 21/06/2025</span>
            </div>
            <div>
              <Badge className="w-20 h-6 bg-gray-300 border-solid border-gray-600">
                <p className="text-xs text-gray-600"> Not Started</p>
              </Badge>
            </div>
          </div>

          <div className="flex justify-between border-b pb-1 mt-1">
            <div className="flex flex-col gap-y-1">
              <h1 className="text-md">Assignment 1</h1>
              <span className="text-xs text-primary">Due: 21/06/2025</span>
            </div>
            <div>
              <Badge className="w-20 h-6 bg-gray-300 border-solid border-gray-600">
                <p className="text-xs text-gray-600"> Not Started</p>
              </Badge>
            </div>
          </div>

          <div className="flex justify-between border-b pb-1 mt-1">
            <div className="flex flex-col gap-y-1">
              <h1 className="text-md">Assignment 1</h1>
              <span className="text-xs text-primary">Due: 21/06/2025</span>
            </div>
            <div>
              <Badge className="w-20 h-6 bg-gray-300 border-solid border-gray-600">
                <p className="text-xs text-gray-600"> Not Started</p>
              </Badge>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
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
        // onClick={() => toAssignmentPage()}
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
            <div className="flex flex-row items-end min-w-full space-x-19 pl-4 pt-2">
              <h1
                className="text-md py-1 font-bold"
                onClick={() => toAssignmentPage()} // Temporary Change to test the Popover
              >
                {class_name} ({semester})
              </h1>
              {statPopOver()}
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
