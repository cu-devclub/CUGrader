'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Table, TableColumnsType } from "antd";
import { TableRowSelection } from "antd/es/table/interface";
import { ChevronDown, ChevronRight, Download, Edit2, Plus, TableOfContents, Upload, User } from "lucide-react";
import { useMemo, useState } from "react";
import { StudentAddDialog, useStudentAddDialogState } from "./student-add-dialog";
import { Student as DialogStudent, StudentBatchEditDialog, StudentEditDialog, StudentWithoutIdAndName, useEditDialogState, useStudentBatchEditDialog, useStudentEditDialog } from "./student-edit-dialog";
import { Student } from "@/lib/api/type";

// TODO: deal with this later
// import '@ant-design/v5-patch-for-react-19';


function createColumnDefs(editDialog: ReturnType<typeof useEditDialogState<DialogStudent, StudentWithoutIdAndName>>) {
  const columns: TableColumnsType<Student> = [
    {
      key: "image",
      render(_, record) {
        return (
          <Avatar className="size-9">
            <AvatarImage src={record.imageUrl} />
            <AvatarFallback>
              <User className="size-5" />
            </AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      key: "studentId",
      dataIndex: "studentId",
      title: "Student ID",
      sorter: (a, b) => parseInt(a.studentId) - parseInt(b.studentId),
      filterSearch: true,
      onFilter: (value, record) => record.studentId.includes(value as string),
    },
    {
      key: "name",
      dataIndex: "name",
      title: "Name",
      sorter: (a, b) => (a.name < b.name) ? -1 : 1
    },
    {
      key: "section",
      dataIndex: "section",
      title: "Section",
      sorter: (a, b) => a.section - b.section
    },
    {
      key: "group",
      dataIndex: "group",
      title: "Group",
      sorter: (a, b) => (a.group < b.group) ? -1 : 1
    },
    {
      key: "score",
      dataIndex: "score",
      title: "Score",
      sorter: (a, b) => a.score - b.score
    },
    {
      key: "actions",
      render: (_, record) => {
        function launch() {
          const { studentId, group, name, section, withdrawed } = record;
          editDialog.launch(studentId, {
            group,
            name,
            section,
            studentId,
            withdrawed
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

  return columns;
}

export interface StudentSectionProps {
  classId: number;
}

export function StudentSection({ classId }: StudentSectionProps) {
  const query = useSuspenseQuery({
    queryKey: ["class", classId, "student"],
    // TODO: get student by class
    queryFn: () => api.students.listByClass(classId)
  });

  const studentAddDialog = useStudentAddDialogState();
  const studentEditDialog = useStudentEditDialog(classId, () => query.refetch());
  const studentBatchEditdialog = useStudentBatchEditDialog(classId, () => query.refetch());

  const [search, setSearch] = useState("");

  // react compiler: still dont do memoization for this
  const columns: TableColumnsType<Student> = useMemo(() => createColumnDefs(studentEditDialog), [studentEditDialog]);

  const filteredStudents = useMemo(() => {
    const s = search.toLowerCase();
    return query.data.filter(it => {
      return it.name.toLowerCase().includes(s) || it.studentId.includes(s);
    });
  }, [search, query.data]);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<Student> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const hasSelected = selectedRowKeys.length > 0;


  function launchBatchEditDialog() {
    if (!hasSelected) {
      return;
    }
    // we gonna just ignore this in the component
    studentBatchEditdialog.launch("", {
      group: "default",
      section: 0,
      withdrawed: true
    });
  }


  return (
    <Collapsible defaultOpen>
      <div className="flex justify-between">
        <CollapsibleTrigger className="flex gap-3 items-center group">
          <ChevronDown className="group-data-[state=closed]:hidden" />
          <ChevronRight className="group-data-[state=open]:hidden" />
          <h2 className="text-xl font-medium"> Students ({query.data.length}) </h2>
        </CollapsibleTrigger>

      </div>
      <CollapsibleContent>
        <section className="mt-4">
          <div className="mt-2 flex flex-col gap-4">
            <StudentEditDialog state={studentEditDialog.state} />
            <StudentAddDialog state={studentAddDialog.state} classId={classId} refetch={() => query.refetch()} />
            <StudentBatchEditDialog state={studentBatchEditdialog.state} studentCount={selectedRowKeys.length} />

            <div className="flex justify-between gap-2">
              <div className="flex gap-2">
                <Input placeholder="Search" value={search} onInput={e => setSearch((e.target as any).value)} />
              </div>
              <div className="flex gap-2">
                {hasSelected &&
                  <Button onClick={launchBatchEditDialog}>
                    <Edit2 />
                    <span> Edit all </span>
                  </Button>
                }
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
                    <Button variant="secondary" size="icon">
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
            </div>

            <Table
              columns={columns}
              rowSelection={rowSelection}
              dataSource={filteredStudents}
              rowKey={({ studentId }) => studentId}
            />
          </div>
        </section>
      </CollapsibleContent>
    </Collapsible>

  );
}