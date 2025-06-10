export type Semester = `${number}/${number}`;

export interface Class {
  classId: number, // map to class_id
  courseId: string;
  courseName: string;
  imageUrl?: string;
}

export interface TeachingClass extends Class {
  sections: number[]; // should be string, not exist
}

export interface Student {
  studentId: string;
  name: string;
  // email: string;
  section: number;
  group: string;
  imageUrl?: string;
  withdrawed: boolean;
  // TODO: think about this
  score: number;
  maxScore: number;
}

export interface Instructor {
  name: string;
  imageUrl?: string;
}

export interface ClassParticipants {
  instructors: Instructor[],
  teachingAssistants: TeachingAssistant[],
  students: Student[],
}

export interface TeachingAssistant {
  name: string;
  // email: string;
  imageUrl?: string;
  leader: boolean;
}

// ===========

export interface InstructorsAndTAs {
  instructors: Instructor[],
  teachingAssistant: TeachingAssistant[];
}

export interface ParticipatingClasses {
  studying: Class[];
  assisting: Class[];
}

export interface CreateStudentRequest {
  email: string,
  section: number,
  group?: string;
}

export interface UpdateStudentRequest {
  section?: number,
  group?: string,
  withdrawed?: boolean;
}

export interface CreateClassRequest {
  courseId: number;
  name: string;
  semester: Semester;
  image?: File;
  /**
   * Student csv file
   */
  students?: File;
}

export type UpdateClassRequest = Partial<CreateClassRequest>;

export interface APIClient {
  // assignments: {
  //   list: (classId: number, studentId: string) => {};
  // },
  students: {
    addToClass: (classId: number, payload: CreateStudentRequest) => Promise<void>,
    // not exist, redundant?
    listByClass: (classId: number) => Promise<Student[]>,
    removeFromClass: (classId: number, studentId: string) => Promise<void>,
    update: (classId: number, studentId: string, data: UpdateStudentRequest) => Promise<void>,
    updateMany: (classId: number, studentIds: string[], data: UpdateStudentRequest) => Promise<void>,
    // TODO: get profile data 
  },
  classes: {
    // will soon exist
    getById: (classId: number) => Promise<Class>,
    listParticipatingBySemester: (semester: Semester) => Promise<ParticipatingClasses>,
    // MARKER: probably included in the api above
    // listTeachingBySemester: (semester: Semester) => Promise<TeachingClass>;
    create: (payload: CreateClassRequest) => Promise<void>, // should it tho
    update: (classId: number, payload: UpdateClassRequest) => Promise<void>,
    // จารย์พลอยไม่เอา
    // delete: (classId: number) => Promise<void>,
  },
  semesters: {
    list: () => Promise<Semester[]>,
  },
  // TODO: think about this later
  // groups: {
  //   listByClass: (classId: number) => {},
  // },
  // sections: {},
  // auth: {},
  instructorsAndTAs: {
    // MARKER: not in openapi.yaml
    listByClass: (classId: number) => Promise<InstructorsAndTAs>, // 
    addToClass: (classId: number, email: string) => Promise<void>,
    removeFromClass: (classId: number, email: string) => Promise<void>,
  },
};
