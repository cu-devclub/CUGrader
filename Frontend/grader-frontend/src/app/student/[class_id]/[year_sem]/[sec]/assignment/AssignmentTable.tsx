"use client";

import React from "react";
import { Table, TableProps, Tag, Space } from "antd";

interface DataType {
  key: number;
  name: string;
  labNumber: number;
  publishDate: string;
  dueDate: string;
  curScore: number;
  maxScore: number;
}

const columns: TableProps<DataType>["columns"] = [
  {
    title: "Assign",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Lab NO.",
    dataIndex: "labNumber",
    key: "labNumber",
    sorter: (a, b) => a.labNumber - b.labNumber,
  },
  {
    title: "Publish Date",
    dataIndex: "publishDate",
    key: "publishDate",
    sorter: (a, b) =>
      new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime(),
  },
  {
    title: "Due Date",
    dataIndex: "dueDate",
    key: "dueDate",
    sorter: (a, b) =>
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
  },
  {
    title: "Score",
    dataIndex: "score",
    key: "score",
    render: (_, record) => (
      <span>
        {record.curScore} / {record.maxScore}
      </span>
    ),
  },
];

interface Props {
  data: DataType[];
}

export default function AssignmentTable({ data }: Props) {
  return (
    <div>
      <Table<DataType>
        columns={columns}
        dataSource={data}
        pagination={false}
        size="middle"
        className="text-xs leading-tight "
      />
    </div>
  );
}
