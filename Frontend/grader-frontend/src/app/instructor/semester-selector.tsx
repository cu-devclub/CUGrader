import { SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Semester } from "@/lib/api/type";
import { Select, SelectValue } from "@radix-ui/react-select";

export interface SemesterSelectorProps {
  semester: string;
  semesterList: string[];
  onSemesterChange: (semester: Semester) => any;
}

export function SemesterSelector({ onSemesterChange, semester, semesterList }: SemesterSelectorProps) {
  return (
    <Select value={semester} onValueChange={onSemesterChange}>
      <SelectTrigger className="w-28">
        <SelectValue placeholder="Select a semester" />
      </SelectTrigger>
      <SelectContent>
        {semesterList.map(semester => <SelectItem key={semester} value={semester}>{semester}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
