"use client";

import { ClassCard } from "@/components/class-card";
import { Bell, LogOut, Plus } from "lucide-react";
import { useState } from "react";
import { SemesterSelector } from "../instructor/semester-selector";
import StudentCard from "./studentCard";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useSuspenseQuery } from "@tanstack/react-query";
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

  const { data: semesterList } = useSuspenseQuery({
    queryKey: ["semester"],
    queryFn: () => api.semesters.list(),
  });

  const [selectedSemester, setSelectedSemester] = useState(semesterList[0]);

  const { data, isLoading } = useSuspenseQuery({
    queryKey: ["ClassData", semesterList],
    queryFn: async () => api.classes.listParticipatingBySemester(selectedSemester),
  });

  // const classData = MockClass(); // Use mocked data

  // const [displayClassesTA, setDisplayClassesTA] = useState<ClassType[]>([]);
  // const [displayClasses, setDisplayClasses] = useState<ClassType[]>([]);

  // const semesters = Array.from(
  //   new Set(classData.assistant.map((cls) => cls.semester))
  // );

  // const semestersStudy = Array.from(
  //   new Set(classData.study.map((cls) => cls.semester))
  // );

  // const changeTAClassDisplay = (sem: string) => {
  //   if (sem === "all") {
  //     setDisplayClassesTA(classData.assistant);
  //   } else {
  //     const filtered = classData.assistant.filter(
  //       (cls) => cls.semester === sem
  //     );
  //     setDisplayClassesTA(filtered);
  //   }
  // };

  // const changeClassDisplay = (sem: string) => {
  //   if (sem === "all") {
  //     setDisplayClasses(classData.study);
  //   } else {
  //     const filtered = classData.study.filter((cls) => cls.semester === sem);
  //     setDisplayClasses(filtered);
  //   }
  // };

  // useEffect(() => {
  //   setDisplayClassesTA(classData.assistant);
  //   setDisplayClasses(classData.study);
  // }, []);

  return (
    <div className="flex-col flex min-h-screen items-center">
      <div className="flex w-[90%] h-25 justify-between items-end border-b pb-4 pl-5">
        {/* Left side: Title */}
        <h1 className="text-3xl font-bold text-primary">All Classes</h1>

        {/* Right side: Buttons */}
        <div className="flex items-center space-x-2 pb-2">
          <Button variant="ghost" className="text-xl mr-8">
            <Plus />
          </Button>
          <Button variant="ghost" className="text-xl">
            <Bell />
          </Button>
          <Button variant="ghost" className="text-xl">
            <LogOut />
          </Button>
        </div>
      </div>

      <div className="w-[90%] flex flex-col pb-5 border-b">
        <div className="flex h-16 space-x-4 items-center px-4 py-5">
          <h1 className="font-bold">Teacher Assistant</h1>
          <SemesterSelector
            semester={selectedSemester}
            onSemesterChange={setSelectedSemester}
            semesterList={semesterList}
          />
        </div>

        <div className="grid gap-7 grid-cols-[repeat(auto-fill,minmax(16rem,20rem))]">
          {data.assisting.map((classTA, index) => (
            <ClassCard
              key={index}
              className={classTA.courseName}
              courseId={classTA.courseId.toString()}
              href=""
              name={classTA.courseName}
              semester={selectedSemester}
              headerImageUrl={classTA.imageUrl}
              menuItems={[]}
            />
          ))}

          {/* {displayClassesTA.map((classTA, index) => (
            <OldClassCard
              key={index}
              id={classTA.classId}
              image={classTA.image}
              class_name={classTA.courseName}
              class_id={classTA.courseId}
              semester={classTA.semester}
            />
          ))} */}
        </div>
      </div>

      {/* Student Section */}
      <div className="flex w-[90%] flex-col">
        <div className="flex h-16 items-center px-4 pt-3 space-x-4">
          <h1 className="font-bold">Student</h1>
          <SemesterSelector
            semester={selectedSemester}
            onSemesterChange={setSelectedSemester}
            semesterList={semesterList}
          />
        </div>
        <div className="grid grid-cols-4 gap-4 my-4">
          {data.studying.map((studyClass, index) => (
            <StudentCard
              key={index}
              id={studyClass.classId}
              class_name={studyClass.courseName}
              class_id={studyClass.courseId}
              image={studyClass.imageUrl}
              semester={selectedSemester}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
