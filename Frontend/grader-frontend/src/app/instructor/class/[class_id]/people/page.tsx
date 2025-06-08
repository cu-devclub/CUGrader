import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { StudentSection } from "./student-section";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function Page() {
  return (
    <>
      <div>
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex gap-3 items-center group">
            <ChevronDown className="group-data-[state=closed]:hidden" />
            <ChevronRight className="group-data-[state=open]:hidden" />
            <h2 className="text-xl font-medium"> Students (420) </h2>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <StudentSection />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </>
  );
}