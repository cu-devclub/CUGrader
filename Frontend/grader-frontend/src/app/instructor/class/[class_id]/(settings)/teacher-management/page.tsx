'use client';

import { useClassData } from "../../class-data-context";
import { InstructorAndTASection } from "../../instructor-section";

export default function Page() {
  const { classData } = useClassData();
  return (
    <div className="space-y-8">
      <InstructorAndTASection classId={classData.id} allowEdit />
    </div>
  );
}

