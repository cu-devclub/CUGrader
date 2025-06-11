'use client';

import { useClassData } from "../../class-data-context";
import { InstructorAndTASection } from "../../instructor-section";
import { StudentSection } from "./student-section";


export default function Page() {
  const { classData } = useClassData();
  // TODO: deal with this, 404 maybe
  return (
    <>
      <div className="space-y-8">
        <InstructorAndTASection classId={classData.id} />
        <StudentSection classId={classData.id} />
      </div>
    </>
  );
}