import React from "react";
import AssignmentCard from "./AssignmentTable";
import mockDataType from "./mockDataType";

import { useTranslations } from "next-intl";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";

// unused now


export default function AssignmentTab() {
  const t = useTranslations("assignment-page");
  const mockData = mockDataType(); // Mock Up Data TODO: Give real data from api(which until now still not have)

  const params = useParams();
  const { data: assigmentsList } = useSuspenseQuery({
    queryKey: ["assigment-page"],
    queryFn: () => api.assignments.listByClass(Number(params.class_id)),
  });

  const doneAssignment = assigmentsList.filter(
    (assign) => assign.status == "completed"
  );

  return (
    <>
      <div className="w-full h-full mt-5">
        <div className="w-full h-1/2 flex flex-col pl-20 pr-8">
          <h1 className="px-4 mb-2">{t("assign-title")}</h1>
          <div className="h-full w-full flex flex-col">
            <AssignmentCard data={assigmentsList}></AssignmentCard>
          </div>
        </div>

        <div className="w-full h-1/2 flex flex-col pl-20 pr-8 mt-6">
          <h1 className="px-4 mb-2">{t("done-title")}</h1>
          <div className="h-full w-full">
            <AssignmentCard data={doneAssignment}></AssignmentCard>
          </div>
        </div>
      </div>
    </>
  );
}
