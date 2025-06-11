import { unimplemented } from "../utils";
import { ClassObject, Configuration, DefaultApi } from "./generated";
import { APIClient, Class, Instructor, Semester, Student } from "./type";


export function createClient(): APIClient {
  const authToken = "TODO: get it, after auth is implemented";
  const config = new Configuration({
    headers: {
      "Authentication": `Bearer ${authToken}`,
    },
    basePath: process.env.NEXT_PUBLIC_BACKEND_URL
  });

  const generatedClient = new DefaultApi(config);

  return {
    students: {
      addToClass: async (classId, { email, section, group }) => {
        await generatedClient.v1StudentPost({
          createStudent: {
            classId,
            email,
            section,
            group
          }
        });
      },
      listByClass: async (classId) => {
        const { students } = await generatedClient.v1StudentClassIdGet({ classId });
        return students.map(it => ({
          ...it,
          // email: "",
          withdrawed: it.withdrawal
        } satisfies Student));
      },
      removeFromClass: async (classId, studentId) => {
        await generatedClient.v1StudentDelete({
          deleteStudent: {
            classId,
            studentId
          }
        });
      },
      update: async (classId, studentId, { withdrawed, group, section }) => {
        await generatedClient.v1StudentPatch({
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
        // TODO: async queue
        await Promise.all(
          studentIds.map(studentId => {
            generatedClient.v1StudentPatch({
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
      // TODO: will soon exist
      getById: async (classId) => {
        return unimplemented("[classes.getById] not exist yet");
      },
      listParticipatingBySemester: async (semester) => {
        const { assistant, study } = await generatedClient.v1ClassesClassesYearSemesterGet({ yearSemester: semester });

        function toClass(input: ClassObject): Class {
          return {
            classId: input.classId,
            courseId: String(input.courseId),
            courseName: input.courseName,
            imageUrl: input.image
          };
        }
        return {
          assisting: assistant!.map(toClass),
          studying: study!.map(toClass)
        };
      },
      create: async ({ courseId, name, semester, image, students }) => {
        await generatedClient.v1ClassPost({
          courseId: parseInt(courseId),
          name,
          semester,
          image,
          students
        });
      },
      update: async (classId, { courseId, image, name, semester, students }) => {
        await generatedClient.v1ClassPatch({
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
        const { semesters } = await generatedClient.v1ClassesSemestersGet();
        // TODO: validate formatting
        return semesters! as Semester[];
      },
    },
    instructorsAndTAs: {
      listByClass: async (classId) => {
        const { assistant, instructor } = await generatedClient.v1TAClassIdGet({ classId });

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
        await generatedClient.v1TAPost({
          tAeditBody: {
            classId,
            email
          }
        });
      },
      removeFromClass: async (classId, email) => {
        await generatedClient.v1TADelete({
          tAeditBody: {
            classId,
            email
          }
        });
      },
    },
  } satisfies APIClient;
};
