import { use } from "react";
import { SettingsForm } from "./settings-form";

interface PageProps {
  params: Promise<{ class_id: string; }>;
}

export default function Page({ params }: PageProps) {
  const { class_id } = use(params);
  // TODO: rethink validation and 404
  const classId = parseInt(class_id);

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-medium"> Settings </h1>
      <SettingsForm />
    </main>
  );
}