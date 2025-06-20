"use client";

import React from "react";
import { Table, TableProps, Tag, Space } from "antd";
import { useTranslations } from "next-intl";

interface DataType {
  key: number;
  name: string;
  labNumber: number;
  publishDate: string;
  dueDate: string;
  curScore: number;
  maxScore: number;
}

interface Props {
  data: DataType[];
}

export default function AssignmentTable({ data }: Props) {
  const t = useTranslations("assignment-page");

  const columns: TableProps<DataType>["columns"] = [
    {
      title: t("assign"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("labNum"),
      dataIndex: "labNumber",
      key: "labNumber",
      sorter: (a, b) => a.labNumber - b.labNumber,
    },
    {
      title: t("publish"),
      dataIndex: "publishDate",
      key: "publishDate",
      sorter: (a, b) =>
        new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime(),
    },
    {
      title: t("due"),
      dataIndex: "dueDate",
      key: "dueDate",
      sorter: (a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    },
    {
      title: t("score"),
      dataIndex: "score",
      key: "score",
      render: (_, record) => (
        <span>
          {record.curScore} / {record.maxScore}
        </span>
      ),
    },
  ];

  return (
    <div>
      <Table<DataType>
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
