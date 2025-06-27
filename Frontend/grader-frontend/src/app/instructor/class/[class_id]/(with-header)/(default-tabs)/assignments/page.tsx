'use client';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import type { InstructorAssignment, UpdateAssignmentPayload } from "@/lib/api/type";
import { CalendarDateTime, fromDate, getLocalTimeZone, toCalendarDateTime } from "@internationalized/date";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useClassData } from "../../../class-data-context";

interface AssignmentUpdateData {
  status?: "unpublished" | "published" | "end";
  publish?: CalendarDateTime;
  due?: CalendarDateTime;
}

export default function Page() {
  const { classData } = useClassData();
  const queryClient = useQueryClient();

  const assignmentsQuery = useSuspenseQuery({
    queryKey: ["class", classData.id, "assignment"],
    queryFn: () => api.assignments.listByClassI(classData.id)
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: ({ assignmentId, payload }: { assignmentId: number, payload: UpdateAssignmentPayload; }) =>
      api.assignments.update(assignmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class", classData.id, "assignment"] });
      toast.success("Assignment updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update assignment", { description: error.message });
    }
  });
  function onUpdateAssignment(assignmentId: number, updatedData: AssignmentUpdateData) {
    if (updatedData.status) {
      let publishDate: Date | undefined;
      let dueDate: Date | undefined;

      // Find the current assignment to check its current state
      const currentAssignment = assignmentsQuery.data.find(a => a.id === assignmentId);
      const currentPublishDate = currentAssignment?.publish.toDate(Intl.DateTimeFormat().resolvedOptions().timeZone);
      const now = new Date();

      switch (updatedData.status) {
        case "published":
          publishDate = new Date();
          break;
        case "end":
          // If setting to "end", ensure it's published first
          if (currentPublishDate && currentPublishDate > now) {
            publishDate = new Date(); // Set to now if not yet published
          }
          // Don't set publishDate if already published
          dueDate = new Date();
          break;
        case "unpublished":
          publishDate = new Date("3000-01-01");
          break;
        default:
          publishDate = new Date();
      }

      const payload: UpdateAssignmentPayload = {};
      if (publishDate) {
        payload.publish = toCalendarDateTime(fromDate(publishDate, getLocalTimeZone()));
      }
      if (dueDate) {
        payload.due = toCalendarDateTime(fromDate(dueDate, getLocalTimeZone()));
      }
      updateAssignmentMutation.mutate({ assignmentId, payload: payload });
      // toast("Assignment status updated", {
      //   description: `Assignment ${assignmentId}: ${JSON.stringify(payload)}`
      // });
      return;
    }
    
    if (updatedData.publish || updatedData.due) {
      const payload: UpdateAssignmentPayload = {};

      if (updatedData.publish) {
        payload.publish = updatedData.publish;
      }
      if (updatedData.due) {
        payload.due = updatedData.due;
      }
      updateAssignmentMutation.mutate({ assignmentId, payload: payload });
      toast("Assignment dates updated", {
        description: `Assignment ${assignmentId}: ${JSON.stringify(payload)}`
      });
      return;
    }

    toast("Update not implemented", { description: `Assignment ${assignmentId}: ${JSON.stringify(updatedData)}` });
  }

  return (
    <main className="space-y-4 pb-12">
      <Button asChild>
        <Link href="./assignments/new">
          <Plus /> New Assignment
        </Link>
      </Button>

      <AssignmentList assignments={assignmentsQuery.data} onUpdateAssignment={onUpdateAssignment} />
    </main>
  );
}

function AssignmentList({
  assignments,
  onUpdateAssignment
}: {
  assignments: InstructorAssignment[];
  onUpdateAssignment: (assignmentId: number, updatedData: AssignmentUpdateData) => void;
}) {
  const locale = useLocale();

  const processedAssignments = useMemo(() => assignments.map(assignment => {
    const now = new Date();
    const publishDate = assignment.publish.toDate(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const dueDate = assignment.due.toDate(Intl.DateTimeFormat().resolvedOptions().timeZone);

    // Determine status based on dates
    let status: "unpublished" | "published" | "end";
    if (publishDate > now) {
      status = "unpublished";
    } else if (dueDate <= now) {
      status = "end";
    } else {
      status = "published";
    }

    return {
      id: assignment.id,
      labNumber: assignment.number,
      labName: assignment.name,
      status,
      publishDate,
      dueDate,
      isExam: false,
    };
  }), [assignments]);

  const handleStatusChange = (assignmentId: number, newStatus: "unpublished" | "published" | "end") => {
    onUpdateAssignment(assignmentId, { status: newStatus });
  };

  const handleDateTimeChange = (
    assignmentId: number,
    dateType: "publishDate" | "dueDate",
    newDate: Date | undefined,
  ) => {
    if (!newDate) return;

    // Convert to CalendarDateTime and update via API
    onUpdateAssignment(assignmentId, {
      [dateType === "publishDate" ? "publish" : "due"]: fromDate(newDate, Intl.DateTimeFormat().resolvedOptions().timeZone)
    });
  };

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

  const getStatusBadge = (status: string, assignmentId: number) => {
    const getStatusStyles = (currentStatus: string) => {
      switch (currentStatus) {
        case "unpublished":
          return "bg-gray-100 border-gray-200 text-gray-700";
        case "published":
          return "bg-teal-50 border-teal-200 text-teal-700";
        case "end":
          return "bg-red-50 border-red-200 text-red-700";
        default:
          return "bg-gray-100 border-gray-200 text-gray-700";
      }
    };

    return (
      <Select value={status} onValueChange={(newStatus) => handleStatusChange(assignmentId, newStatus as "unpublished" | "published" | "end")}>
        <SelectTrigger className={`w-32 h-8 ${getStatusStyles(status)}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unpublished">Unpublished</SelectItem>
          <SelectItem value="published">Published</SelectItem>
          <SelectItem value="end">End</SelectItem>
        </SelectContent>
      </Select>
    );
  };

  const DateTimePicker = ({
    date,
    onDateTimeChange,
    isExam,
  }: {
    date: Date;
    onDateTimeChange: (date: Date | undefined) => void;
    isExam: boolean;
  }) => {
    const [selectedDate, setSelectedDate] = useState<Date>(date);
    const [timeValue, setTimeValue] = useState(
      date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false })
    );

    const handleDateSelect = (newDate: Date | undefined) => {
      if (!newDate) return;

      const [hours, minutes] = timeValue.split(":").map(Number);
      const updatedDate = new Date(newDate);
      updatedDate.setHours(hours, minutes);

      setSelectedDate(updatedDate);
      onDateTimeChange(updatedDate);
    };

    const handleTimeChange = (newTime: string) => {
      setTimeValue(newTime);

      const [hours, minutes] = newTime.split(":").map(Number);
      const updatedDate = new Date(selectedDate);
      updatedDate.setHours(hours, minutes);

      setSelectedDate(updatedDate);
      onDateTimeChange(updatedDate);
    };

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="border text-sm font-normal"
          >
            {formatDateTime(date)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} initialFocus />
          <div className="mt-3 p-3 border-t">
            <Label htmlFor="time" className="text-sm font-medium">
              Time
            </Label>
            <Input
              id="time"
              type="time"
              value={timeValue}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="mt-1"
            />
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="flex gap-4 text-sm font-medium text-gray-500 mb-2">
        <div className="w-24">Lab Number</div>
        <div className="grid grid-cols-4 gap-4 flex-1">
          <div>Lab Name</div>
          <div>Status</div>
          <div>Publish</div>
          <div>Due</div>
        </div>
      </div>      {/* Card Rows */}
      <div className="space-y-3">
        {processedAssignments.map((assignment) => (
          <AssignmentCard
            key={assignment.id}
            assignment={assignment}
            getStatusBadge={getStatusBadge}
            DateTimePicker={DateTimePicker}
            handleDateTimeChange={handleDateTimeChange}
          />
        ))}
      </div>
    </div>
  );
}

function AssignmentCard({
  assignment,
  getStatusBadge,
  DateTimePicker,
  handleDateTimeChange
}: {
  assignment: {
    id: number;
    labNumber: number;
    labName: string;
    status: "unpublished" | "published" | "end";
    publishDate: Date;
    dueDate: Date;
    isExam: boolean;
  };
  getStatusBadge: (status: string, assignmentId: number) => React.ReactElement;
  DateTimePicker: ({ date, onDateTimeChange, isExam }: {
    date: Date;
    onDateTimeChange: (date: Date | undefined) => void;
    isExam: boolean;
  }) => React.ReactElement;
  handleDateTimeChange: (assignmentId: number, dateType: "publishDate" | "dueDate", newDate: Date | undefined) => void;
}) {
  return (
    <Link
      href={`./assignments/${assignment.id}`}
      className={`flex gap-4 items-center rounded-lg overflow-clip border shadow-sm transition-all hover:shadow-md`}
    >
      <div className="flex items-center self-stretch justify-center w-12 mr-12 bg-secondary font-semibold text-lg">
        {assignment.labNumber}
      </div>
      <div className="flex-1 grid grid-cols-4 gap-4 items-center py-2 ">
        <div className="font-medium">{assignment.labName}</div>
        <div onClick={(e) => e.preventDefault()}>{getStatusBadge(assignment.status, assignment.id)}</div>
        <div onClick={(e) => e.preventDefault()}>
          <DateTimePicker
            date={assignment.publishDate}
            onDateTimeChange={(date) => handleDateTimeChange(assignment.id, "publishDate", date)}
            isExam={assignment.isExam}
          />
        </div>
        <div onClick={(e) => e.preventDefault()}>
          <DateTimePicker
            date={assignment.dueDate}
            onDateTimeChange={(date) => handleDateTimeChange(assignment.id, "dueDate", date)}
            isExam={assignment.isExam}
          />
        </div>
      </div>
    </Link>
  );
}
