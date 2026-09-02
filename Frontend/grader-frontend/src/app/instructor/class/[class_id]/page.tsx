import { redirect, RedirectType } from "next/navigation";


interface PageProps {
  params: Promise<{ class_id: string; }>;
}

export default async function Page({ params }: PageProps) {
  const { class_id } = await params;

  redirect(`/instructor/class/${class_id}/people`, RedirectType.replace);
}
