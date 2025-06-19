'use client'

import { use } from "react";
import { AssignmentForm } from "./assignment-form";

interface PageProps {
  params: Promise<{ class_id: string; }>;
}

export default function Page({ params }: PageProps) {
  const { class_id } = use(params);
  const classId = parseInt(class_id);

  return (
    <main className="space-y-6">
      <AssignmentForm classId={classId} />
    </main>
  );
}