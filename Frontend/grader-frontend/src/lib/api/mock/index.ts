import { APIClient } from "../type";
import { generateName } from "./name";
import { DbClass, Persistence } from "./persistence";

interface Database {
  classes: DbClass[];
}

async function init(client: APIClient) {
  await client.classes.create({
    courseId: "1",
    name: "Programming",
    semester: "2025/1",
  });

  await client.classes.create({
    courseId: "758",
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

function createClient(persistence: Persistence<Database>): APIClient {
  let currentClassId = 420;
  const classes = persistence.data.classes;

  function getClassById(id: number) {
    const target = persistence.data.classes.find(it => it.classId === id);
    if (!target) {
      throw new Error(`${id} class not found`);
    }
    return target;
  }

  async function getUrl(id: string | undefined) {
    return id ? await persistence.getFileUrl(id) : undefined;
  }

  const client: APIClient = {
    students: {
      async addToClass(classId, { email, section, group }) {
        const c = getClassById(classId);
        console.log({ email });
        c.students.push({
          group: group ?? "Default",
          section,
          studentId: email.split("@")[0],
          name: generateName(),
          score: 0,
          withdrawed: false,
        });
        persistence.persist();
      },
      async listByClass(classId) {
        const students = getClassById(classId).students;
        return Promise.all(students.map(async (it) => ({
          ...it,
          imageUrl: await getUrl(it.imageFileId),
          maxScore: 100,
        })));
      },
      async removeFromClass(classId, studentId) {
        const target = getClassById(classId);
        target.students = target.students.filter(it => it.studentId !== studentId);
        persistence.persist();
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
        persistence.persist();
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
        persistence.persist();
      },
    },
    classes: {
      async create({ courseId, name, semester, image, students }) {
        if (students) {
          console.warn("[mock] Ignoring students csv file");
        }
        let fileId: string | undefined = undefined;
        if (image) {
          fileId = await persistence.saveFile(image);
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
        persistence.persist();
      },
      async getById(classId) {
        const c = getClassById(classId);
        console.log(c);
        return {
          ...c,
          imageUrl: await getUrl(c.imageFileId)
        };
      },
      async listParticipatingBySemester(semester) {
        const classesInSemester = classes.filter(it => it.semester === semester);
        const classesWithImages = await Promise.all(
          classesInSemester.map(async it => ({
            ...it,
            imageUrl: await getUrl(it.imageFileId)
          }))
        );

        return {
          assisting: classesWithImages,
          studying: classesWithImages
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
          const id = await persistence.saveFile(payload.image);
          target.imageFileId = id;
        }
        if (payload.students) {
          console.warn("[mock] Ignoring students csv file");
        }
        persistence.persist();
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
        // if student.chula.ac.th -> TA otherwise its instructor
        const c = getClassById(classId);
        if (email.split("@")[1] === "student.chula.ac.th") {
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
        persistence.persist();
      },
      async removeFromClass(classId, email) {
        const target = getClassById(classId);
        target.instructors = target.instructors.filter(it => it.email !== email);
        target.assistants = target.assistants.filter(it => it.email !== email);
        persistence.persist();
      },
    },
    semesters: {
      list: async () => {
        const s = classes.map(it => it.semester);
        return [...new Set(s)]; // remove duplicated
      }
    }
  };

  return client;
}


const persistence = new Persistence<Database>("default", {
  classes: []
});

export function createMockClient() {
  const client = createClient(persistence);

  // to make hydration error less painful
  if (persistence.fresh || !globalThis.window) {
    console.log("Reinit");
    init(client);
  }

  return client;
}