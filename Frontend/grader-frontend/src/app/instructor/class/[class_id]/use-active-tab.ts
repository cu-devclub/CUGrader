import { usePathname } from "next/navigation";

export function useActiveTab() {
  const path = usePathname();
  const segments = path.split('/');
  const pageSegment = segments[4]; // instructor/class/{class_id}/{page}
  
  const pages = [
    "assignments",
    "people", 
    "exam-mode",
    "settings",
    "teacher-management"
  ] as const;
  
  return pages.includes(pageSegment as any) ? pageSegment as typeof pages[number] : null;
}
