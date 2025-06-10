import { CreateStudent } from "./generated";
import { APIClient, Class, Instructor, Semester, Student, TeachingAssistant } from "./type";

type DbClass = Omit<Class, "imageUrl"> & {
  students: DbStudent[];
  semester: Semester; // TODO: move this to normal api response later
  assistants: DbAssistant[];
  instructors: DbInstructor[];

  imageFileId?: number;
};

type DbStudent = Omit<Student, "maxScore" | "imageUrl"> & {
  imageFileId?: number;
};
type DbInstructor = Omit<Instructor, ""> & {
  email: string;
  imageFileId?: number;
};
type DbAssistant = TeachingAssistant & {
  email: string;
  imageFileId?: number;
};

function choice<T>(elements: T[]): T {
  const index = Math.floor(Math.random() * elements.length);
  return elements[index];
}

export function generateName() {
  const firstNames = ["Arjun", "Ryan", "Shah", "May", "Thomas", "Erdogan", "Taylor", "Muhammad", "Martin", "Azhar", "Thaksin", "Ivan", "Francis", "Leo", "Evan", "Satya",];
  const lastNames = ["Smith", "Brown", "Williams", "Shinawatra", "Miller", "Wang", "Kowalski", "Anderson", "Adolf", "Singh", "Watson", "Yoisaki", "Doe", "Li", "Kim", "Nguyen"];
  return `${choice(firstNames)} ${choice(lastNames)}`;
}

export const files: Map<number, File> = new Map();

// TODO: env
export const useMockServer = true;
function getImageUrl(id: number | undefined) {
  if (!id) {
    return "";
  }
  if (useMockServer) {
    return URL.createObjectURL(files.get(id)!);
  } else {
    return `/api/dev/file?fileId=${id}`;
  }
}

function createClient(): APIClient {
  const classes: DbClass[] = [];

  let currentClassId = 420;

  function getClassById(id: number) {
    const target = classes.find(it => it.classId === id);
    if (!target) {
      throw new Error(`${id} class not found`);
    }
    return target;
  }

  async function init() {
    await client.classes.create({
      courseId: 1,
      name: "Programming",
      semester: "2025/1",
    });

    await client.classes.create({
      courseId: 758,
      name: "sone",
      semester: "2024/2",
    });

    await client.instructorsAndTAs.addToClass(420, "ame@student.chula.ac.th");
    await client.instructorsAndTAs.addToClass(420, "suisei@student.chula.ac.th");
    await client.instructorsAndTAs.addToClass(420, "mark45@chula.ac.th");

    await client.instructorsAndTAs.addToClass(421, "71382213@student.chula.ac.th");
    await client.instructorsAndTAs.addToClass(421, "wave@chula.ac.th");
    await client.instructorsAndTAs.addToClass(421, "ajarn@chula.ac.th");

    await client.students.addToClass(420, {
      email: "12@student.chula.ac.th",
      section: 0,
    });

    await client.students.addToClass(420, {
      email: "45@student.chula.ac.th",
      section: 0,
    });

    await client.students.addToClass(420, {
      email: "2223@student.chula.ac.th",
      section: 0,
    });

    await client.students.addToClass(420, {
      email: "12313@student.chula.ac.th",
      section: 0,
    });
  }

  const client: APIClient = {
    students: {
      async addToClass(classId, { email, section, group }) {
        const c = getClassById(classId);
        c.students.push({
          group: group ?? "Default",
          section,
          studentId: email.split("@")[0],
          name: generateName(),
          score: 0,
          withdrawed: false,
        });
      },
      async listByClass(classId) {
        return getClassById(classId).students.map(it => ({
          ...it,
          imageUrl: getImageUrl(it.imageFileId),
          maxScore: 100,
        }));
      },
      async removeFromClass(classId, studentId) {
        const target = getClassById(classId);
        target.students = target.students.filter(it => it.studentId !== studentId);
      },
      async update(classId, studentId, { group, section, withdrawed }) {
        const target = getClassById(classId);
        // console.log(studentId)
        const student = target.students.find(it => it.studentId === studentId);
        if (!student) {
          throw new Error("student not found");
        }
        if (group) {
          student.group = group;
        }
        if (section) {
          student.section = section;
        }
        if (withdrawed) {
          student.withdrawed = withdrawed;
        }
      },
      async updateMany(classId, studentIds, { group, section, withdrawed }) {
        const target = getClassById(classId);
        for (const id of studentIds) {
          const student = target.students.find(it => it.studentId === id);
          if (!student) {
            continue;
            // throw new Error("student not found");
          }
          if (group) {
            student.group = group;
          }
          if (section) {
            student.section = section;
          }
          if (withdrawed) {
            student.withdrawed = withdrawed;
          }
        }
      },
    },
    classes: {
      async create({ courseId, name, semester, image, students }) {
        if (students) {
          console.warn("[mock] Ignoring students csv file");
        }
        const fileId = image ? Date.now() : undefined;
        if (image) {
          files.set(fileId!, image);
        }
        classes.push({
          courseId: String(courseId),
          courseName: name,
          classId: currentClassId++,
          // TODO: this wont work on the server
          imageFileId: fileId,
          students: [],
          semester,
          assistants: [],
          instructors: []
        });
      },
      async getById(classId) {
        return getClassById(classId);
      },
      async listParticipatingBySemester(semester) {
        return {
          assisting: classes.filter(it => it.semester === semester),
          studying: classes.filter(it => it.semester === semester)
        };
      },
      async update(classId, payload) {
        const target = getClassById(classId);

        if (payload.courseId) {
          target.courseId = String(payload.courseId);
        }
        if (payload.name) {
          target.courseName = payload.name;
        }
        if (payload.semester) {
          target.semester = payload.semester;
        }
        if (payload.image) {
          const id = Date.now();
          files.set(id, payload.image);
          target.imageFileId = id;
        }
        if (payload.students) {
          console.warn("[mock] Ignoring students csv file");
        }
      },
    },
    instructorsAndTAs: {
      async listByClass(classId) {
        const c = getClassById(classId);
        return {
          instructors: c.instructors,
          teachingAssistant: c.assistants
        };
      },
      async addToClass(classId, email) {
        // if students.chula.ac.th -> TA otherwise its instructor
        const c = getClassById(classId);
        if (email.split("@")[1] === "students.chula.ac.th") {
          c.assistants.push({
            name: generateName(),
            email,
            leader: false,
          });
        } else {
          c.instructors.push({
            name: generateName(),
            email,
          });
        }
      },
      async removeFromClass(classId, email) {
        const target = getClassById(classId);
        target.instructors = target.instructors.filter(it => it.email !== email);
        target.assistants = target.assistants.filter(it => it.email !== email);
      },
    },
    semesters: {
      list: async () => {
        const s = classes.map(it => it.semester);
        return [...new Set(s)]; // remove duplicated
      }
    }
  };

  init();
  return client;
}


// TODO: handle file upload

type Leaves<T> = T extends object
  ? {
    [K in keyof T]: `${Exclude<K, symbol>}${Leaves<T[K]> extends never ? "" : `.${Leaves<T[K]>}`}`;
  }[keyof T]
  : never;

export interface MockRPCCommand {
  command: Leaves<APIClient>,
  params: any[];
}

export const api = createClient();

export async function dispatch({ command, params }: MockRPCCommand) {
  const path = command.split(".");
  // console.log({ api, path });
  let fn = api as any;
  while (path.length !== 0) {
    fn = fn[path.shift()!];
  }
  return await fn(...params);
}
