import React from "react";
import AssignmentCard from "./AssignmentTable";
import mockDataType from "./mockDataType";
import { Button } from "@/components/ui/button";

export default function page() {
  const mockData = mockDataType(); // Mock Up Data TODO: Give real data

  return (
    <div className="flex min-h-screen">
      <div className="w-1/6 border-gray-300 flex flex-col items-center bg-gray-300">
        <div className="min-w-full flex px-4 py-4 items-center">
          <button className="mb-4">☰</button>
        </div>

        <div className="min-w-full flex px-6 pb-7 gap-y-3 items-start flex-col">
          <button>Notification</button>
          <button>Profile</button>
        </div>

        <div className="min-w-full flex px-6 pb-7 gap-y-3 items-start flex-col bg-white"></div>
      </div>

      <div className="w-5/6 border-gray-300 flex flex-col items-center">
        <div className="flex flex-row min-w-full h-20 space-x-5 px-24">
          <Button className="flex self-end h-13 w-30 bg-gray-300 justify-start items-center px-2">
            Assignment
          </Button>
          <button className="self-end h-13 w-30">profile</button>
        </div>

        <div className="w-full h-full mt-4">
          <div className="w-full h-1/2 flex flex-col pl-20 pr-8">
            <h1 className="px-4 mb-1">Assigned</h1>
            <div className="h-full w-full  flex flex-col">
              <AssignmentCard data={mockData}></AssignmentCard>
            </div>
          </div>

          <div className="w-full h-1/2 flex flex-col pl-20 pr-8 ">
            <h1 className="px-4 mb-1">Done</h1>
            <div className="h-full w-full">
              <AssignmentCard data={mockData}></AssignmentCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
