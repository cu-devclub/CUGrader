'use client';

import { createContext, ReactNode, use } from 'react';

export interface ClassData {
  id: number;
  name: string;
  courseId: string;
  year: number;
  semester: number;
  headerImageUrl?: string;
}

interface ClassDataContextType {
  classData: ClassData; // Changed from ClassData | null
}

const ClassDataContext = createContext<ClassDataContextType | undefined>(undefined);

export function ClassDataProvider({ children, data }: { children: ReactNode, data: ClassData }) { // Changed data prop from ClassData | null
  return (
    <ClassDataContext.Provider value={{ classData: data }}>
      {children}
    </ClassDataContext.Provider>
  );
}

export function useClassData() {
  const context = use(ClassDataContext);
  if (context === undefined) {
    throw new Error('useClassData must be used within a ClassDataProvider');
  }
  // context.classData is now guaranteed to be ClassData if this point is reached.
  return context; // Returns { classData: ClassData }
}

