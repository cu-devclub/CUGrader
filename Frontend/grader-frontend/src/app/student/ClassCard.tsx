import React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  id: number;
  class_id: number;
  class_name: string;
  image: string;
  semester: string;
}

export default function ClassCard({
  class_id,
  class_name,
  image,
  semester,
}: Props) {
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

            <div className="px-3">
              <p className="text-xs text-gray-400">{class_id}</p>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
