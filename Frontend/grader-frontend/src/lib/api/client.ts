import { parseDateTime } from "@internationalized/date";
import { unimplemented } from "../utils";
import { ClassObject, Configuration, DefaultApi, LabLabIdGet200Response } from "./generated";
import { APIClient, Assignment, Class, Instructor, NearDueAssignment, Semester, Student } from "./type";

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
      getById: async (classId) => {
        const c = await generatedClient.classClassIdGet({ classId });
        return toClass(c);
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
    sections: {
      getByClass: async (classId) => {
        const { sections } = await generatedClient.sectionClassIdGet({ classId });
        return sections ?? [];
      }
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
            email: it.email,
          }) satisfies Instructor),
          teachingAssistant: assistant.map(it => ({
            leader: it.leader,
            name: it.name,
            imageUrl: it.picture,
            email: it.email,
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
    assignments: {
      listNearDue: async () => {
        const { labs } = await generatedClient.nearDueDateGet();

        return labs!.map(it => ({
          id: it.labId!,
          due: parseDateTime(it.labDue!),
          name: it.labName!,
          courseName: it.courseName!,
          courseId: String(it.courseId!),
          // TODO: request classId for linking
          maxScore: it.labMaxScore!,
        } satisfies NearDueAssignment));
      },

      listByClass: async (classId) => {
        return unimplemented("TODO: this should be array");
        // const { raw } = await generatedClient.labsClassIdGetRaw({ classId });
        // technically we can parse this but not now
        // const value = JSON.parse(await raw.json()) as Value[];
      },

      listByClassI: async (classId) => {
        return unimplemented("TODO: this should be array");
      },


      create: async (classId, p) => {
        await generatedClient.labPost({
          classId,
          labData: {
            addfiles: p.additionalFiles,
            assignTo: p.assignedGroupIds,
            closeOnDue: p.closeOnDue,

            examMode: false,
            examPin: 0, // TODO: might allow this to be set since creation?

            due: p.due.toString(), // ISO 8601 should be compatatible with RFC 3339,
            publish: p.publish.toString(),

            name: p.name,
            number: p.number,
            questions: p.questions,
            showScoreOnLock: p.showScoreOnLock,
            testcase: p.testCode,
            secretTestcase: p.secretTestCode,
          }
        });
      },

      update: async (labId, p) => {
        await generatedClient.labPatch({
          labId,
          labData: {
            // THIS IS ONLY FOR APPENDING FILES 
            addfiles: p.filesToAdd,
            assignTo: p.assignedGroupIds,
            closeOnDue: p.closeOnDue,

            examMode: false,
            examPin: 0,

            due: p.due.toString(),
            publish: p.publish.toString(),

            name: p.name,
            number: p.number,
            questions: p.questions,
            showScoreOnLock: p.showScoreOnLock,
            testcase: p.testCode,
            secretTestcase: p.secretTestCode,
          }
        });
      },

      getById: async (labId) => {
        // this will throw
        // TODO: think about this
        const lab = await generatedClient.labLabIdGet({ labId });
        return {
          name: lab.name!,
          languages: lab.language!,
          assignedGroupIds: lab.assignTo!,
          closeOnDue: lab.closeOnDue!,
          examMode: lab.examMode!,
          due: parseDateTime(lab.due!),
          publish: parseDateTime(lab.publish!),
          number: lab.number!,
          questionIds: lab.questionIds!,
          additionalFileIds: lab.addfiles!,

          get id() {
            return unimplemented("id not yet exist");
          },
          set id(_) { },

          get maxScore() {
            return unimplemented("maxScore not yet exist");
          },
          set maxScore(_) { },

          get score() {
            return unimplemented("score not yet exist");
          },
          set score(_) { },

          get status() {
            return unimplemented("status not yet exist");
          },
          set status(_) { },
        };
      },

      getByIdI: async (labId) => {
        return unimplemented();
      },

      downloadFile: async (fileId) => {
        const c = await generatedClient.addfileAddfileIdGet({ addfileId: fileId });
        return c;
      },

      removeFile: async (fileId) => {
        await generatedClient.addfileAddfileIdDelete({
          addfileId: fileId
        });
      },
    },
    questions: {
      getById: async (questionId) => {
        const q = await generatedClient.questionQuestionIdGet({ questionId });

        return {
          description: q.description!,
          maxScore: q.maxScore!,
          name: q.name!,
          number: q.number!,
          template: q.predefine!,
          submission: q.submission && {
            id: q.submission.submissionId!,
            score: q.submission.score!,
            submittedAt: parseDateTime(q.submission.timestamp!)
          }
        };
      },
      getByIdI: async (questionId) => {
        return unimplemented();
      },
    },
    supportedLanguages: {
      list: async () => {
        const response = await generatedClient.languageGet();
        return response.languages?.map(lang => lang.name!) || [];
      },
    }
  } satisfies APIClient;
};
