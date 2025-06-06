import React from "react";
import AssignmentCard from "./AssignmentCard";

export default function page() {
  return (
    <div className="flex min-h-screen">
      <div className="w-1/6 border border-solid border-gray-300 flex flex-col items-center bg-gray-300">
        <div className="min-w-full flex border border-solid px-4 py-4 items-center">
          <button className="mb-4">☰</button>
        </div>

        <div className="min-w-full flex border border-solid px-6 pb-7 gap-y-3 items-start flex-col">
          <button>Notification</button>
          <button>Profile</button>
        </div>

        <div className="min-w-full flex border border-solid px-6 pb-7 gap-y-3 items-start flex-col bg-white"></div>
      </div>

      <div className="w-5/6 border border-solid border-gray-300 flex flex-col items-center">
        <div className="flex flex-row min-w-full h-27 space-x-5 px-24 border border-solid">
          <button className="flex self-end h-13 w-30 bg-gray-300 justify-start items-center px-2">
            Assignment
          </button>
          <button className="self-end h-13 w-30">profile</button>
        </div>

        <div className="w-full h-full mt-7 border border-solid">
          <div className="w-full h-1/2 border border-solid flex flex-col pl-20 pr-8">
            <h1 className="px-4 mb-1">Assigned</h1>
            <div className="h-full w-full mb-6 bg-gray-300 flex flex-col px-2 py-3 gap-y-2">
              <AssignmentCard></AssignmentCard>
            </div>
          </div>

          <div className="w-full h-1/2 border border-solid flex flex-col pl-20 pr-8">
            <h1 className="px-4 mb-4">Done</h1>
            <div className="h-full w-full mb-2 bg-gray-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
