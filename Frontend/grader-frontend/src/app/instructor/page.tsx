'use client';

import { ClassCard } from '@/components/class-card';
import { Button } from '@/components/ui/button';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { CreateClassDialog } from './create-class-dialog';
import { SemesterSelector } from './semester-selector';
import { api } from '@/lib/api';

// TODO: rename this
export default function InstructorPage() {
  const { data: semesterList } = useSuspenseQuery({
    queryKey: ['semester'],
    queryFn: () => api.semester.list(),
  });

  const [selectedSemester, setSelectedSemester] = useState(semesterList[0]);

  const { data: classes } = useSuspenseQuery({
    queryKey: ['class', selectedSemester],
    queryFn: () => api.class.listBySemester(selectedSemester),
  });

  const [showCreateClassDialog, setShowCreateClassDialog] = useState(false);

  return (
    <>
      <CreateClassDialog open={showCreateClassDialog} onOpenChange={setShowCreateClassDialog} />
      <div className='flex flex-col p-4 gap-3'>
        <div className='flex justify-between items-center'>
          <div className='flex items-center gap-6'>
            <h1 className='text-3xl font-medium text-primary'> All Classes </h1>
            <SemesterSelector semester={selectedSemester} onSemesterChange={setSelectedSemester} semesterList={semesterList} />
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowCreateClassDialog(true)}>
            <Plus />
          </Button>
        </div>

        <hr />

        <div className='grid gap-4 grid-cols-[repeat(auto-fill,minmax(16rem,1fr))]'>
          {classes.assistant.map(it =>
            <ClassCard
              key={it.classId}
              courseId={it.courseId}
              menuItems={[]}
              href={`/instructor/class/${it.classId}/people`}
              name={it.courseName}
              headerImageUrl={it.image}
              semester={selectedSemester}
            />
          )}
        </div>
      </div>
    </>
  );
}
