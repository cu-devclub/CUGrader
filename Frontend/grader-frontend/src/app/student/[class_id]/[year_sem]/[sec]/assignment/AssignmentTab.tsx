import React from "react";
import AssignmentCard from "./AssignmentTable";
import mockDataType from "./mockDataType";

export default function AssignmentTab() {
  const mockData = mockDataType(); // Mock Up Data TODO: Give real data from api(which until now still not have)

  return (
    <>
      <div className="w-full h-full mt-5">
        <div className="w-full h-1/2 flex flex-col pl-20 pr-8">
          <h1 className="px-4 mb-2">Assigned</h1>
          <div className="h-full w-full flex flex-col">
            <AssignmentCard data={mockData}></AssignmentCard>
          </div>
        </div>

        <div className="w-full h-1/2 flex flex-col pl-20 pr-8 mt-6">
          <h1 className="px-4 mb-2">Done</h1>
          <div className="h-full w-full">
            <AssignmentCard data={mockData}></AssignmentCard>
          </div>
        </div>
      </div>
    </>
  );
}
