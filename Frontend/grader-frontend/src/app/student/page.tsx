import React from "react";
import StudentCard from "./studentCard";
import ClassCard from "./ClassCard";

export default function page() {
  return (
    <div className="flex min-h-screen">
      <div className="w-16 border border-solid border-gray-300 flex flex-col items-center">
        <button className="mb-4">☰</button>
        <button className="mb-4">＋</button>
        <button className="mb-4">🔒</button>
      </div>

      <div className="flex-1 flex-col">
        <div className="flex h-16 border border-solid justify-between">
          <div></div>
          <div className="min-w-1/4 flex items-center justify-center space-x-6">
            <button>Notification</button>
            <button>Log out</button>
          </div>
        </div>

        <div className="flex flex-col px-24">
          <div className="flex h-16 border border-solid p-4 space-x-4">
            <h1 className="text-2xl font-bold">TA</h1>
            <select className="border rounded px-2 py-1">
              <option className="flex justify-center items-center">
                2024/1
              </option>
            </select>
          </div>

          <div className="flex my-4 space-x-10 border border-solid min-w-full flex-row">
            <ClassCard
              id={1}
              class_name="101 Class"
              class_id={2301111}
              image="Image"
            />
          </div>
        </div>

        <div className="flex flex-col px-18">
          <div className="flex h-16 border border-solid px-10">
            <h1 className="text-2xl font-bold">Student</h1>
          </div>
          <div className="border border-solid">
            <StudentCard />
          </div>
        </div>
      </div>
    </div>
  );
}
