'use client';

import { api } from "@/lib/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { use } from "react";
import { DesktopCodeSpace } from "./desktop";

interface CodeSpacePageProps {
  params: Promise<{
    class_id: string,
    assignment_id: string;
  }>;
}

// TODO: throw a 404

export default function CodeSpacePage({ params }: CodeSpacePageProps) {
  const { assignment_id, class_id } = use(params);
  const classId = parseInt(class_id);
  const assignmentId = parseInt(assignment_id);

  const { data: assignment } = useSuspenseQuery({
    queryKey: ["class", classId, "assignemts", assignmentId],
    queryFn: () => api.assignments.getById(assignmentId)
  });

  return <DesktopCodeSpace
    lab={assignment}
  />;
}

