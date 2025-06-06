import { ClassCard } from '@/components/class-card';
import { CreateClassDialog } from './create-class-dialog';

export default function Page() {
  return (
    <div className='flex flex-col p-4'>
      <CreateClassDialog />
      <div className='grid gap-4'>
        <ClassCard />
      </div>
    </div>
  );
}
