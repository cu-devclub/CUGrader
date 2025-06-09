"use client";

import React from "react";
import StudentCard from "./studentCard";
import ClassCard from "./ClassCard";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Ghost } from "lucide-react";
import { json } from "stream/consumers";

export default function page() {
  const fetchData = async () => {
    const res = await api.class.listBySemester("2024/2");
    return res;
  };

  const { data: classData, isLoading } = useQuery({
    queryKey: ["ClassData"],
    queryFn: fetchData,
  });

  console.log(JSON.stringify(classData, null, 2));

  return (
    <div className="flex min-h-screen">
      <div className="w-16 flex flex-col justify-between items-center border border-solid">
        <div>
          <Button variant="ghost" className="mb-4">
            ☰
          </Button>
          <Button variant="ghost" className="mb-2">
            ＋
          </Button>
          <Button variant="ghost" className="mb-2">
            🔒
          </Button>
        </div>

        <div>
          <Button variant="ghost" className="mb-2">
            {"=>"}
          </Button>
          <Button variant="ghost" className="mb-2">
            TH
          </Button>
          <Button variant="ghost" className="mb-2">
            EN
          </Button>
        </div>
      </div>

      <div className="flex-1 flex-col">
        <div className="flex h-16 justify-between">
          <div></div>
          <div className="min-w-1/4 flex items-center justify-center space-x-6">
            <Button className="bg-primary">Notification</Button>
            <Button variant="ghost">Log out</Button>
          </div>
        </div>

        <div className="flex flex-col px-24">
          <div className="flex h-16 p-4 space-x-4">
            <h1 className="text-2xl font-bold">TA</h1>
            <select className="border rounded px-2 py-1">
              <option className="flex justify-center items-center">
                2025/1
              </option>
            </select>
          </div>

          <div className="grid grid-cols-5 gap-4 my-4 space-x-10 min-w-full">
            {classData?.assistant.map((classTA, index) => (
              <ClassCard
                key={index}
                id={classTA.classId}
                image={classTA.image}
                class_name={classTA.courseName}
                class_id={classTA.courseId}
                semester="2025/1"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col px-18">
          <div className="flex h-16 item-center px-11 pt-3">
            <h1 className="text-2xl font-bold">Student</h1>
          </div>
          <div className="grid grid-cols-5 gap-4 my-4">
            {/* {classData?.assistant.map((classTA, index) => ( */}
            {classData?.study.map((studyClass, index) => (
              <StudentCard
                key={studyClass.classId}
                id={studyClass.classId}
                class_name={studyClass.courseName}
                class_id={studyClass.courseId}
                image={studyClass.image}
                semester="2025/1"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
