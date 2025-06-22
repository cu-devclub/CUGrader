'use client';

import { api } from "@/lib/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useClassData } from "../../../class-data-context";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/datetime";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Page() {
  const { classData } = useClassData();
  const assignmentsQuery = useSuspenseQuery({
    queryKey: ["class", classData.id, "assignment"],
    queryFn: () => api.assignments.listByClassI(classData.id)
  });


  // TODO: i might make this a table
  return (
    <main className="space-y-4">
      <h1 className="text-xl"> Assignments </h1>
      <p> it's either i polish this later or we have the design </p>
      <Button asChild>
        <Link href="./assignments/new">
          <Plus /> New Assignment
        </Link>
      </Button>
      <div className="mt-6 md:grid grid-cols-2">
        {assignmentsQuery.data.map(assignment => (
          <Link key={assignment.id} className="block group" href={`./assignments/${assignment.id}`}>
            <Card className="gap-3 group-hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{assignment.name}</CardTitle>
                <CardDescription>md description (not exist yet, might remove)</CardDescription>
                <CardAction>{assignment.number}</CardAction>
              </CardHeader>
              <CardContent>
                <p>publish {formatDateTime(assignment.publish)}</p>
                <p>due {formatDateTime(assignment.due)}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}