'use client';

import { AssignmentForm, AssignmentFormResult } from "@/components/assignment-form";
import { api } from "@/lib/api";
import { UpdateAssignmentPayload } from "@/lib/api/type";
import { parseDateTime } from "@internationalized/date";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { use } from "react";
import { useClassData } from "../../class-data-context";

export default function Page({ params }: { params: Promise<{ assignment_id: string; }>; }) {
  const { assignment_id } = use(params);
  const { classData } = useClassData();
  const t = useTranslations();
  const router = useRouter();
  const assignmentId = parseInt(assignment_id);

  const queryClient = useQueryClient();

  const { data: assignment } = useSuspenseQuery({
    queryKey: ['class', classData.id, 'assignment', assignmentId],
    queryFn: () => api.assignments.getByIdI(assignmentId),
  });

  const mutation = useMutation({
    mutationFn: async (data: AssignmentFormResult) => {
      const payload: UpdateAssignmentPayload = {
        name: data.name,
        number: data.number,
        publish: parseDateTime(data.publish),
        due: parseDateTime(data.due),
        languages: data.languages,
        examMode: data.examMode,
        closeOnDue: data.closeOnDue,
        showScoreOnLock: data.showScoreOnLock,
        examPin: data.examPin,
        assignedGroupIds: data.assignedGroupIds,
        testCode: data.testCode,
        secretTestCode: data.secretTestCode,
        questions: data.questions.map((q, index) => ({
          number: index + 1,
          name: q.name,
          description: q.description,
          template: q.template,
          maxScore: q.maxScore,
          answer: q.answer,
          testCode: q.testCode,
          secretTestCode: q.secretTestCode,
          testcases: q.testcases,
          secretTestCases: q.secretTestCases,
        })),
        filesToAdd: data.additionalFiles,
      };

      // Handle file removals and update assignment in parallel
      const promises: Promise<any>[] = [];

      if (data.toRemoveExistingFileIds.length > 0) {
        promises.push(...data.toRemoveExistingFileIds.map(fileId =>
          api.assignments.removeFile(fileId)
        ));
      }

      promises.push(api.assignments.update(assignmentId, payload));

      await Promise.all(promises);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['class', classData.id, 'assignment'] });
      toast.success(t('assignment.form.messages.updateSuccess'));
      router.push(`/instructor/class/${classData.id}/assignments`);
    },
    onError: (error) => {
      console.error(error);
      toast.error(t('assignment.form.messages.updateError'), {
        description: error.message,
      });
    },
  });


  function submit(data: AssignmentFormResult) {
    mutation.mutate(data);
  }

  if (!assignment) {
    return <div>Assignment not found</div>;
  }

  return (
    <main className="space-y-6">
      <AssignmentForm
        classId={classData.id}
        isPending={mutation.isPending}
        submit={submit}
        cancel={() => router.push(`/instructor/class/${classData.id}/assignments`)}
        existingFiles={assignment.additionalFileIds?.map(id => ({ id, name: `File ${id}` })) || []}
        prefill={{
          name: assignment.name,
          number: assignment.number,
          publish: assignment.publish.toString(),
          due: assignment.due.toString(),
          languages: assignment.languages,
          examMode: assignment.examMode,
          closeOnDue: assignment.closeOnDue,
          showScoreOnLock: assignment.showScoreOnLock,
          examPin: assignment.examPin,
          assignedGroupIds: assignment.assignedGroupIds,
          testCode: assignment.testCode,
          secretTestCode: assignment.secretTestCode,
          questions: assignment.questions.map(q => ({
            name: q.name,
            description: q.description,
            template: q.template,
            maxScore: q.maxScore,
            answer: q.answer,
            testCode: q.testCode,
            secretTestCode: q.secretTestCode,
            testcases: q.testcases,
            secretTestCases: q.secretTestCases,
          })),
        }}
      />
    </main>
  );
}
