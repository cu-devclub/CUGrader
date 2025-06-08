'use client';

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { StudentInfo } from "@/lib/api/generated";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Table, TableColumnsType } from "antd";
import { TableRowSelection } from "antd/es/table/interface";
import { Download, Edit2, Plus, TableOfContents, Upload } from "lucide-react";
import { useState } from "react";
import { Student, StudentEditDialog, StudentWithoutIdAndName, useEditDialogState } from "./student-edit-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StudentAddDialog, StudentAddDialogMode, useStudentAddDialogState } from "./student-add-dialog";

// TODO: deal with this later
// import '@ant-design/v5-patch-for-react-19';

interface StudentTableProps {
  classId: number;
}

function StudentTable({ classId }: StudentTableProps) {
  const query = useSuspenseQuery({
    queryKey: ["class", classId, "student"],
    // TODO: get student by class
    queryFn: () => api.student.list()
  });

  const editDialog = useEditDialogState<Student, StudentWithoutIdAndName>({
    async onDone(id, value) {
      await api.student.update(classId, id, {
        group: value.group,
        section: value.section,
        withdrawal: value.withdrawed
      });
      await query.refetch();
    },
  });

  const columns: TableColumnsType<StudentInfo> = [
    {
      key: "image",
      render(value, record, index) {
        const { picture } = record;
        return (
          <div className="size-9 rounded-full bg-primary">

          </div>
        );
      },
    },
    {
      key: "studentId",
      dataIndex: "studentId",
      title: "Student ID",
    },
    {
      key: "name",
      dataIndex: "name",
      title: "Name",
    },
    {
      key: "section",
      dataIndex: "section",
      title: "Section",
    },
    {
      key: "group",
      dataIndex: "group",
      title: "Group",
    },
    {
      key: "score",
      dataIndex: "score",
      title: "Score",
    },
    {
      key: "actions",
      render: (_, record) => {
        function launch() {
          const { studentId, group, name, withdrawal, section } = record;
          editDialog.launch(studentId, {
            group,
            name,
            section,
            studentId,
            withdrawed: withdrawal
          });
        }

        return (
          <Button variant="ghost" onClick={launch}>
            <Edit2 className="size-4" />
          </Button>
        );
      },
    },
  ];

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<StudentInfo> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const hasSelected = selectedRowKeys.length > 0;


  return (
    <div className="mt-2 flex flex-col gap-4">
      <StudentEditDialog
        state={editDialog.state}
      />

      <Table
        columns={columns}
        rowSelection={rowSelection}
        dataSource={query.data}
        rowKey={({ studentId }) => studentId}
      />
    </div>
  );
}

export function StudentSection() {
  const studentAddDialog = useStudentAddDialogState();

  return (
    <section className="mt-2">
      <div className="flex justify-end gap-2">
        <StudentAddDialog state={studentAddDialog.state} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus />
              <span>Add Student</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => studentAddDialog.launch("manual")}>
              <TableOfContents /> Manual
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => studentAddDialog.launch("file")}>
              <Upload /> Upload file
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">
              <Download />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {/* TODO: icon maybe? */}
            <DropdownMenuItem>Download Student list</DropdownMenuItem>
            <DropdownMenuItem>Download Template</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
      <StudentTable classId={0} />
    </section>
  );
}