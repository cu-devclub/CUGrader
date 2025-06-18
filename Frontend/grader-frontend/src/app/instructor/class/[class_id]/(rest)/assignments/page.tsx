'use client';

import { useSuspenseQuery } from "@tanstack/react-query";
import { useClassData } from "../../class-data-context";
import { api } from "@/lib/api";

export default function Page() {
  const { classData } = useClassData();
  const assignmentsQuery = useSuspenseQuery({
    queryKey: ["class", classData.id, "assignment"],
    queryFn: () => api.assignments.listByClassI(classData.id)
  });

  return (
    <>
      <h1 className="text-xl"> Assignments </h1>
      <p> it's either i will polish this later or until we have the design </p>
      <p> 
        {JSON.stringify(assignmentsQuery.data)}
      </p>
    </>
  );
}