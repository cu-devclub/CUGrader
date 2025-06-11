import { use } from "react";
import { InstructorAndTASection } from "./instructor-section";
import { StudentSection } from "./student-section";

interface Props {
  params: Promise<{ class_id: string; }>;
}

export default function Page({ params }: Props) {
  const { class_id } = use(params);
  // TODO: deal with this, 404 maybe
  const classId = parseInt(class_id);
  return (
    <>
      <div className="space-y-8">
        <InstructorAndTASection classId={classId} />
        <StudentSection classId={classId} />
      </div>
    </>
  );
}