"use client";
// unused now

import React from "react";
import { Table, TableProps, Tag, Space } from "antd";
import { useTranslations } from "next-intl";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { StudentAssignment } from "@/lib/api/type";

interface Props {
  data: StudentAssignment[];
}

export function toDateTimeString(dt: any): string {
  if (!dt) return "-";

  const pad = (n: number) => n.toString().padStart(2, "0");

  const { year, month, day, hour = 0, minute = 0 } = dt;

  return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}`;
}

function toTimestamp(dt: any): number {
  if (!dt) return 0;
  return new Date(
    dt.year,
    dt.month - 1,
    dt.day,
    dt.hour ?? 0,
    dt.minute ?? 0,
    dt.second ?? 0
  ).getTime();
}

export default function AssignmentTable({ data }: Props) {
  const t = useTranslations("assignment-page");
  const params = useParams();

  const columns: TableProps<StudentAssignment>["columns"] = [
    {
      title: t("assign"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("labNum"),
      dataIndex: "number",
      key: "number",
      sorter: (a, b) => a.number - b.number,
    },
    {
      title: t("publish"),
      dataIndex: "publish",
      key: "publish",
      render: (_, record) => toDateTimeString(record.publish),
      sorter: (a, b) =>
        toTimestamp(toDateTimeString(a.publish)) -
        toTimestamp(toDateTimeString(b.publish)),
    },
    {
      title: t("due"),
      dataIndex: "dueDate",
      key: "dueDate",
      render: (_, record) => toDateTimeString(record.due),
      sorter: (a, b) =>
        toTimestamp(toDateTimeString(a.publish)) -
        toTimestamp(toDateTimeString(b.publish)),
    },
    {
      title: t("score"),
      dataIndex: "score",
      key: "score",
      render: (_, record) => (
        <span>
          {record.score} / {100}
        </span>
      ),
    },
  ];

  return (
    <div>
      <Table<StudentAssignment>
        columns={columns}
        dataSource={data}
        pagination={false}
        size="middle"
        className="text-xs leading-tight"
        scroll={{ x: "max-content" }}
      />
    </div>
  );
}
