import { ClassObject, Configuration, DefaultApi } from "./generated";
import { APIClient, Class, Instructor, Semester, Student } from "./type";

function toClass(input: ClassObject): Class {
  return {
    classId: input.classId,
    courseId: String(input.courseId),
    courseName: input.courseName,
    imageUrl: input.image
  };
}

export function createClient(): APIClient {
  const authToken = "TODO: get it, after auth is implemented";
  const config = new Configuration({
    headers: {
      "Authentication": `Bearer ${authToken}`,
    },
    basePath: process.env.NEXT_PUBLIC_BACKEND_URL,
  });

  const generatedClient = new DefaultApi(config);

  return {
    students: {
      addToClass: async (classId, { email, section, group }) => {
        await generatedClient.studentPost({
          createStudent: {
            classId,
            email,
            section,
            group
          }
        });
      },
      listByClass: async (classId) => {
        const { students } = await generatedClient.studentClassIdGet({ classId });
        return students.map(it => ({
          ...it,
          // email: "",
          withdrawed: it.withdrawal
        } satisfies Student));
      },
      removeFromClass: async (classId, studentId) => {
        await generatedClient.studentDelete({
          deleteStudent: {
            classId,
            studentId
          }
        });
      },
      update: async (classId, studentId, { withdrawed, group, section }) => {
        await generatedClient.studentPatch({
          editStudent: {
            classId,
            studentId,
            group,
            section,
            withdrawal: withdrawed
          }
        });
      },
      updateMany: async (classId, studentIds, data) => {
        // TODO: async queue maybe
        await Promise.all(
          studentIds.map(studentId => {
            generatedClient.studentPatch({
              editStudent: {
                classId,
                studentId,
                ...data
              }
            });
          })
        );
      },
    },
    classes: {
      // TODO: fix this
      getById: async (classId) => {
        const { semesters } = await generatedClient.classesSemestersGet();

        const promises = (semesters ?? []).map(async s => {
          const { assistant, study } = await generatedClient.classesClassesYearSemesterGet({ yearSemester: s });
          const classes = [...assistant ?? [], ...study ?? []];

          const target = classes.find(it => it.classId === classId);
          if (!target) {
            throw new Error("not this semester");
          }

          return toClass(target);
        });

        return await Promise.any(promises);
        // return unimplemented("the api to get class by its id does not yet exist.");
      },
      listParticipatingBySemester: async (semester) => {
        const { assistant, study } = await generatedClient.classesClassesYearSemesterGet({ yearSemester: semester });

        return {
          assisting: assistant!.map(toClass),
          studying: study!.map(toClass)
        };
      },
      create: async ({ courseId, name, semester, image, students }) => {
        await generatedClient.classPost({
          courseId: parseInt(courseId),
          name,
          semester,
          image,
          students
        });
      },
      update: async (classId, { courseId, image, name, semester, students }) => {
        await generatedClient.classPatch({
          classId,
          courseId: courseId ? parseInt(courseId) : undefined,
          image,
          name,
          semester,
          students
        });
      },
    },
    semesters: {
      list: async () => {
        const { semesters } = await generatedClient.classesSemestersGet();
        // TODO: validate formatting
        return semesters! as Semester[];
      },
    },
    instructorsAndTAs: {
      listByClass: async (classId) => {
        const { assistant, instructor } = await generatedClient.tAClassIdGet({ classId });

        return {
          instructors: instructor.map(it => ({
            name: it.name,
            imageUrl: it.picture,
            email: "not-exist",
          }) satisfies Instructor),
          teachingAssistant: assistant.map(it => ({
            leader: it.leader,
            name: it.name,
            imageUrl: it.picture,
            email: "not-exist",
          }))
        };
      },
      addToClass: async (classId, email) => {
        await generatedClient.tAPost({
          tAeditBody: {
            classId,
            email
          }
        });
      },
      removeFromClass: async (classId, email) => {
        await generatedClient.tADelete({
          tAeditBody: {
            classId,
            email
          }
        });
      },
    },
  } satisfies APIClient;
};
