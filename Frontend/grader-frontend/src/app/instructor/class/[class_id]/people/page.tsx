import { InstructorSection, TeachingAssistantSection } from "./instructor-section";
import { StudentSection } from "./student-section";

export default function Page() {
  return (
    <>
      <div className="space-y-8">
        <InstructorSection />
        <TeachingAssistantSection />
        <StudentSection />
      </div>
    </>
  );
}