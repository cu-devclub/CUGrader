"use client";

import React, { useEffect, useState } from "react";
import StudentCard from "./studentCard";
import ClassCard from "./ClassCard";
import MockClass from "./mockClass";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

type Assistant = {
  name: string;
  email: string;
  leader: boolean;
  picture: string;
};

type ClassType = {
  classId: number;
  courseId: number;
  courseName: string;
  image: string;
  semester: string;
  assistants: Assistant[];
};

export default function Page() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["ClassData"],
    queryFn: async () => {
      const res = await api.class.listBySemester("2024/2");
      return res;
    },
  });

  console.log(JSON.stringify(data, null, 2));

  const classData = MockClass(); // Use mocked data

  const [displayClassesTA, setDisplayClassesTA] = useState<ClassType[]>([]);
  const [displayClasses, setDisplayClasses] = useState<ClassType[]>([]);

  const semesters = Array.from(
    new Set(classData.assistant.map((cls) => cls.semester))
  );

  const semestersStudy = Array.from(
    new Set(classData.study.map((cls) => cls.semester))
  );

  const changeTAClassDisplay = (sem: string) => {
    if (sem === "all") {
      setDisplayClassesTA(classData.assistant);
    } else {
      const filtered = classData.assistant.filter(
        (cls) => cls.semester === sem
      );
      setDisplayClassesTA(filtered);
    }
  };

  const changeClassDisplay = (sem: string) => {
    if (sem === "all") {
      setDisplayClasses(classData.study);
    } else {
      const filtered = classData.study.filter((cls) => cls.semester === sem);
      setDisplayClasses(filtered);
    }
  };

  useEffect(() => {
    setDisplayClassesTA(classData.assistant);
    setDisplayClasses(classData.study);
  }, []);

  return (
    <div className="flex-col flex min-h-screen items-center">
      <div className="flex w-[90%] h-25 justify-between items-end border-b pb-4 pl-5">
        {/* Left side: Title */}
        <h1 className="text-3xl font-bold text-pink-500">All Classes</h1>

        {/* Right side: Buttons */}
        <div className="flex items-center space-x-4">
          <button className="text-xl mr-8">＋</button>
          <button className="text-xl">🔔</button>
          <button className="text-xl">👤</button>
        </div>
      </div>

      <div className="w-[90%] flex flex-col pb-5 border-b">
        <div className="flex h-16 space-x-4 items-center px-4 py-5">
          <h1 className="font-bold">Teacher Assistant</h1>
          <select
            className="border rounded px-2"
            onChange={(e) => changeTAClassDisplay(e.target.value)}
          >
            <option value="all">All Semesters</option>
            {semesters.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-5 gap-4 my-4 space-x-20 min-w-full">
          {displayClassesTA.map((classTA, index) => (
            <ClassCard
              key={index}
              id={classTA.classId}
              image={classTA.image}
              class_name={classTA.courseName}
              class_id={classTA.courseId}
              semester={classTA.semester}
            />
          ))}
        </div>
      </div>

      {/* Student Section */}
      <div className="flex w-[90%] flex-col">
        <div className="flex h-16 items-center px-4 pt-3 space-x-4">
          <h1 className="font-bold">Student</h1>
          <select
            className="border rounded px-2 py-1"
            onChange={(e) => changeClassDisplay(e.target.value)}
          >
            <option value="all">All Semesters</option>
            {semestersStudy.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-4 gap-4 my-4">
          {displayClasses.map((studyClass, index) => (
            <StudentCard
              key={index}
              id={studyClass.classId}
              class_name={studyClass.courseName}
              class_id={studyClass.courseId}
              image={studyClass.image}
              semester={studyClass.semester}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
