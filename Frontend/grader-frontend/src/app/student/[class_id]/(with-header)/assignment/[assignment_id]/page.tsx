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
import { Clock, Calendar, CheckCircle, AlertCircle, XCircle, ArrowLeft, FileText, Copy } from "lucide-react";

export default function Page() {
  const params = useParams();
  // TODO: refactor this to use classId from context or props
  const classData = { id: 420 };
  const assignmentId = parseInt(params.assignment_id as string);

  const assignmentQuery = useSuspenseQuery({
    queryKey: ["class", classData.id, "assignment"],
    queryFn: () => api.assignments.getById(assignmentId)
  });

  return (
    <main className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          {/* TODO: static path */}
          <Link href="./">
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
  const params = useParams();

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
              <Button size="lg" className="flex items-center gap-2" asChild>
                <Link href={`/student/${params.class_id}/assignment/${params.assignment_id}/editor`} prefetch={false}>
                  <FileText className="w-5 h-5" />
                  Start Working
                </Link>
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
      {assignment.questions && assignment.questions.length > 0 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Questions ({assignment.questions.length})</CardTitle>
            </CardHeader>
          </Card>
          {assignment.questions.map((question, index) => (
            <Card key={question.number}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  {question.name}
                  <Badge variant="outline" className="ml-auto">
                    {question.maxScore} points
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: question.description }} />
                </div>

                {question.template && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Template Code:</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(question.template)}
                        className="flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </Button>
                    </div>
                    <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto text-sm">
                      <code>{question.template}</code>
                    </pre>
                  </div>
                )}

                {question.submission && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Your Submission</h4>
                      <Badge variant={question.submission.score === question.maxScore ? "default" : "secondary"}>
                        {question.submission.score} / {question.maxScore} points
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Submitted: {new Intl.DateTimeFormat('en', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }).format(question.submission.submittedAt.toDate(Intl.DateTimeFormat().resolvedOptions().timeZone))}
                    </p>
                  </div>
                )}

                {isAvailable && !isOverdue && (
                  <div className="border-t pt-4">
                    <Button className="w-full">
                      {question.submission ? 'Edit Submission' : 'Start Coding'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
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
