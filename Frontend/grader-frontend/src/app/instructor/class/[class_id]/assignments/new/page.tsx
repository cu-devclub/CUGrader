'use client';

import { AssignmentForm, AssignmentFormResult } from "@/components/assignment-form";
import { api } from "@/lib/api";
import { CreateAssignmentPayload } from "@/lib/api/type";
import { parseDateTime } from "@internationalized/date";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useClassData } from "../../class-data-context";

export default function Page({ }) {
  const { classData } = useClassData();
  const t = useTranslations();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (data: AssignmentFormResult) => {
      const payload: CreateAssignmentPayload = {
        name: data.name,
        number: data.number,
        publish: parseDateTime(data.publish),
        due: parseDateTime(data.due),
        // maxScore: unimplemented("this is computed property now"),
        languages: data.languages,
        examMode: data.examMode,
        closeOnDue: !data.allowLateSubmission,
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
        additionalFiles: data.additionalFiles
      };

      // console.log(payload);
      await api.assignments.create(classData.id, payload);
    },
    onSuccess: () => {
      toast.success(t('assignment.form.messages.createSuccess'));
      router.push(`/instructor/class/${classData.id}/assignments`);
    },
    onError: (error) => {
      console.error(error);
      toast.error(t('assignment.form.messages.createError'), {
        description: error.message,
      });
    },
  });


  return (
    <main className="space-y-6">
      <AssignmentForm
        classId={classData.id}
        isPending={mutation.isPending}
        submit={res => mutation.mutate(res)}
        cancel={() => { }}
      />
    </main>
  );
}