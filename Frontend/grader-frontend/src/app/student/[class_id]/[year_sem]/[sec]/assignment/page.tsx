'use client';

import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { StudentAssignment, AssignmentStatus } from "@/lib/api/type";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AlertCircle, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function Page() {
  const params = useParams();
  // const classId = parseInt(params.class_id as string);
  const classId = 420;
  const assignmentsQuery = useSuspenseQuery({
    queryKey: ["student", "class", classId, "assignments"],
    queryFn: () => api.assignments.listByClass(classId)
  });

  return (
    <main className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assignments</h1>
      </div>

      <StudentAssignmentList assignments={assignmentsQuery.data} />
    </main>
  );
}

function StudentAssignmentList({
  assignments,
}: {
  assignments: StudentAssignment[];
}) {
  const processedAssignments = useMemo(() => {
    const now = new Date();

    return assignments.map(assignment => {
      const publishDate = assignment.publish.toDate(Intl.DateTimeFormat().resolvedOptions().timeZone);
      const dueDate = assignment.due.toDate(Intl.DateTimeFormat().resolvedOptions().timeZone);

      // Determine if assignment is available
      const isAvailable = publishDate <= now;
      const isOverdue = dueDate < now;
      const isDueSoon = !isOverdue && dueDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000; // 24 hours

      return {
        ...assignment,
        publishDate,
        dueDate,
        isAvailable,
        isOverdue,
        isDueSoon,
      };
    }).sort((a, b) => {
      // Sort by due date, with available assignments first
      if (a.isAvailable !== b.isAvailable) {
        return a.isAvailable ? -1 : 1;
      }
      return a.dueDate.getTime() - b.dueDate.getTime();
    });  }, [assignments]);

  const todoAssignments = processedAssignments.filter(a => a.isAvailable && a.status !== "completed");
  const doneAssignments = processedAssignments.filter(a => a.status === "completed");

  return (
    <div className="space-y-8">
      {/* Todo Assignments */}
      {todoAssignments.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 text-blue-700">Todo</h2>
          {/* Table Header */}
          <div className="flex gap-4 text-sm font-medium text-gray-500 mb-2">
            <div className="w-24">Lab #</div>
            <div className="grid grid-cols-4 gap-4 flex-1">
              <div>Assignment Name</div>
              <div>Status</div>
              <div>Dates</div>
              <div>Score</div>
            </div>
          </div>          <div className="space-y-3">            {todoAssignments.map((assignment) => (
              <StudentAssignmentCard
                key={assignment.id}
                assignment={assignment}
                borderColor="border-l-blue-500"
                isOverdue={assignment.isOverdue}
              />
            ))}
          </div>
        </section>
      )}

      {/* Done Assignments */}
      {doneAssignments.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 text-green-700">Done</h2>
          {/* Table Header */}
          <div className="flex gap-4 text-sm font-medium text-gray-500 mb-2">
            <div className="w-24">Lab #</div>
            <div className="grid grid-cols-4 gap-4 flex-1">
              <div>Assignment Name</div>
              <div>Status</div>
              <div>Dates</div>
              <div>Score</div>
            </div>
          </div>          <div className="space-y-3">            {doneAssignments.map((assignment) => (
              <StudentAssignmentCard
                key={assignment.id}
                assignment={assignment}
                borderColor="border-l-green-500"
                isOverdue={false}
              />
            ))}
          </div>
        </section>
      )}      {/* Empty State */}
      {assignments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No assignments available</div>
          <div className="text-gray-400 text-sm mt-2">Check back later for new assignments</div>
        </div>
      )}
    </div>
  );
}

type ProcessedAssignment = StudentAssignment & {
  publishDate: Date;
  dueDate: Date;
  isAvailable: boolean;
  isOverdue: boolean;
  isDueSoon: boolean;
};

function StudentAssignmentCard({
  assignment,
  borderColor,
  isOverdue
}: {
  assignment: ProcessedAssignment;
  borderColor: string;
  isOverdue: boolean;
}) {
  const locale = useLocale();
  
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };
  const getStatusInfo = (assignment: ProcessedAssignment) => {
    if (!assignment.isAvailable) {
      return {
        icon: <Clock className="w-4 h-4" />,
        text: "Not Available",
        variant: "secondary" as const,
        color: "text-gray-600"
      };
    }

    if (assignment.isOverdue && assignment.status !== "completed") {
      return {
        icon: <XCircle className="w-4 h-4" />,
        text: "Missing",
        variant: "destructive" as const,
        color: "text-red-600"
      };
    }

    if (assignment.isDueSoon && assignment.status !== "completed") {
      return {
        icon: <AlertCircle className="w-4 h-4" />,
        text: "Due Soon",
        variant: "outline" as const,
        color: "text-orange-600"
      };
    }

    // Map API status to UI status
    switch (assignment.status) {
      case "completed":
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: "Submitted",
          variant: "default" as const,
          color: "text-green-600"
        };
      case "partially-completed":
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: "Draft",
          variant: "outline" as const,
          color: "text-blue-600"
        };
      case "new":
        return {
          icon: <Clock className="w-4 h-4" />,
          text: "Assigned",
          variant: "outline" as const,
          color: "text-gray-600"
        };
      case "lated":
        return {
          icon: <XCircle className="w-4 h-4" />,
          text: "Missing",
          variant: "destructive" as const,
          color: "text-red-600"
        };
      case "due-soon":
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: "Due Soon",
          variant: "outline" as const,
          color: "text-orange-600"
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          text: "Available",
          variant: "outline" as const,
          color: "text-gray-600"
        };
    }
  };

  const statusInfo = getStatusInfo(assignment);
  const actualBorderColor = isOverdue ? 'border-l-red-500' : borderColor;

  return (
    <Link href={`./assignment/${assignment.id}`} className="block">
      <div className={`flex gap-4 items-center rounded-lg overflow-clip border shadow-sm transition-all hover:shadow-md border-l-4 ${actualBorderColor} ${isOverdue ? 'opacity-80' : ''}`}>
        <div className="flex items-center self-stretch justify-center w-12 mr-12 bg-secondary font-semibold text-lg">
          {assignment.number}
        </div>
        <div className="flex-1 grid grid-cols-4 gap-4 items-center py-4">
          <div className="font-medium">{assignment.name}</div>
          <div className="flex items-center gap-2">
            <Badge variant={statusInfo.variant} className="flex items-center gap-1">
              {statusInfo.icon}
              {statusInfo.text}
            </Badge>
          </div>
          <div className="text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDateTime(assignment.publishDate)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Clock className={`w-3 h-3 ${assignment.isDueSoon || assignment.isOverdue ? 'text-red-500' : 'text-gray-500'}`} />
              {formatDateTime(assignment.dueDate)}
            </div>
          </div>
          <div className="text-sm">
            <div className="font-medium">{assignment.score || 0} points</div>
            <div className={`text-xs ${statusInfo.color}`}>{statusInfo.text}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
