'use client';

import { api } from "@/lib/api";
import type { StudentAssignmentDetails } from "@/lib/api/type";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, CheckCircle, AlertCircle, XCircle, ArrowLeft, FileText } from "lucide-react";

export default function Page() {
  const params = useParams();
  const assignmentId = parseInt(params.assignment_id as string);
  
  const assignmentQuery = useSuspenseQuery({
    queryKey: ["student", "assignment", assignmentId],
    queryFn: () => api.assignments.getById(assignmentId)
  });

  return (
    <main className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="../">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assignments
          </Link>
        </Button>
      </div>
      
      <StudentAssignmentDetail assignment={assignmentQuery.data} />
    </main>
  );
}

function StudentAssignmentDetail({
  assignment,
}: {
  assignment: StudentAssignmentDetails;
}) {
  const locale = useLocale();

  const now = new Date();
  const publishDate = assignment.publish.toDate(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const dueDate = assignment.due.toDate(Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  // Determine if assignment is available
  const isAvailable = publishDate <= now;
  const isOverdue = dueDate < now;
  const isDueSoon = !isOverdue && dueDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000; // 24 hours

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  const getStatusInfo = () => {
    if (!isAvailable) {
      return {
        icon: <Clock className="w-5 h-5" />,
        text: "Not Available",
        variant: "secondary" as const,
        color: "text-gray-600",
        bgColor: "bg-gray-50"
      };
    }
    
    if (isOverdue) {
      return {
        icon: <XCircle className="w-5 h-5" />,
        text: "Overdue",
        variant: "destructive" as const,
        color: "text-red-600",
        bgColor: "bg-red-50"
      };
    }
    
    if (isDueSoon) {
      return {
        icon: <AlertCircle className="w-5 h-5" />,
        text: "Due Soon",
        variant: "outline" as const,
        color: "text-orange-600",
        bgColor: "bg-orange-50"
      };
    }

    switch (assignment.status) {
      case "completed":
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          text: "Completed",
          variant: "default" as const,
          color: "text-green-600",
          bgColor: "bg-green-50"
        };
      case "partially-completed":
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          text: "In Progress",
          variant: "outline" as const,
          color: "text-blue-600",
          bgColor: "bg-blue-50"
        };
      default:
        return {
          icon: <Clock className="w-5 h-5" />,
          text: "Available",
          variant: "outline" as const,
          color: "text-gray-600",
          bgColor: "bg-gray-50"
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="space-y-6">
      {/* Assignment Header */}
      <Card className={`${statusInfo.bgColor} border-l-4 ${isOverdue ? 'border-l-red-500' : isAvailable ? 'border-l-green-500' : 'border-l-blue-500'}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">
                Lab {assignment.number}: {assignment.name}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Published: {formatDateTime(publishDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${isDueSoon || isOverdue ? 'text-red-500' : 'text-gray-500'}`} />
                  <span>Due: {formatDateTime(dueDate)}</span>
                </div>
              </div>
            </div>
            <Badge variant={statusInfo.variant} className="flex items-center gap-2 text-sm px-3 py-1">
              {statusInfo.icon}
              {statusInfo.text}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Current Score:</span>
              <span className="font-semibold text-lg">{assignment.score || 0} points</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Language:</span>
              <span className="font-medium">{assignment.languages?.join(', ') || 'Not specified'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Mode:</span>
              <span className="font-medium">{assignment.examMode ? 'Exam Mode' : 'Normal'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Actions */}
      {isAvailable && !isOverdue && (
        <Card>
          <CardHeader>
            <CardTitle>Start Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button size="lg" className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Start Working
              </Button>
              {assignment.additionalFileIds && assignment.additionalFileIds.length > 0 && (
                <Button variant="outline" size="lg" className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Download Files ({assignment.additionalFileIds.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignment Questions */}
      {assignment.questionIds && assignment.questionIds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Questions ({assignment.questionIds.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignment.questionIds.map((questionId, index) => (
                <div key={questionId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span>Question {questionId}</span>
                  </div>
                  {isAvailable && !isOverdue && (
                    <Button variant="outline" size="sm">
                      View Question
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Assignment ID:</span>
              <span className="font-mono">{assignment.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Close on Due:</span>
              <span>{assignment.closeOnDue ? 'Yes' : 'No'}</span>
            </div>
            {assignment.assignedGroupIds && assignment.assignedGroupIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Assigned Groups:</span>
                <span>{assignment.assignedGroupIds.join(', ')}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Not Available Message */}
      {!isAvailable && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="text-center py-8">
            <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-700 mb-2">Assignment Not Yet Available</h3>
            <p className="text-blue-600">
              This assignment will be available on {formatDateTime(publishDate)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Overdue Message */}
      {isOverdue && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="text-center py-8">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Assignment Overdue</h3>
            <p className="text-red-600">
              This assignment was due on {formatDateTime(dueDate)}
            </p>
            {!assignment.closeOnDue && (
              <p className="text-red-500 text-sm mt-2">
                You may still be able to submit, but it will be marked as late.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
