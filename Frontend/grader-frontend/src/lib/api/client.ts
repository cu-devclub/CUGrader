import { parseDateTime } from "@internationalized/date";
import { getCookie } from "cookies-next/client";
import { unimplemented } from "../utils";
import { ClassObject, Configuration, DefaultApi, GetLabsByClassId200ResponseInnerStatusEnum } from "./generated";
import { APIClient, AssignmentStatus, Class, CreateAssignmentPayload, CreateClassPayload, CreateStudentPayload, Instructor, InstructorAssignment, InstructorAssignmentDetails, InstructorQuestion, NearDueAssignment, Semester, Student, StudentAssignment, StudentAssignmentDetails, UpdateAssignmentPayload, UpdateClassPayload, UpdateStudentPayload } from "./type";

function toClass(input: ClassObject): Class {
  return {
    classId: input.classId!,
    courseId: String(input.courseId!),
    courseName: input.courseName!,
    get imageUrl() {
      return unimplemented("TODO: wait i need to fetch again????");
    },
    set imageUrl(_) { }
  };
}

function toStatus(status: GetLabsByClassId200ResponseInnerStatusEnum | undefined): AssignmentStatus {
  switch (status) {
    case GetLabsByClassId200ResponseInnerStatusEnum.New:
      return "new";
    case GetLabsByClassId200ResponseInnerStatusEnum.PartialComplete:
      return "partially-completed";
    case GetLabsByClassId200ResponseInnerStatusEnum.Complete:
      return "completed";
    case GetLabsByClassId200ResponseInnerStatusEnum.Late:
      return "lated";
    case GetLabsByClassId200ResponseInnerStatusEnum.DueSoon:
      return "due-soon";
    default:
      return "new";
  }
}

export function createClient() {
  const authToken = getCookie('auth_token');
  const config = new Configuration({
    headers: {
      "Authentication": `Bearer ${authToken}`,
    },
    basePath: process.env.NEXT_PUBLIC_BACKEND_URL,
  });

  const generatedClient = new DefaultApi(config);

  const client: APIClient = {
    students: {
      addToClass: async (classId: number, { email, section, group }: CreateStudentPayload) => {
        await generatedClient.addStudentToClass({
          addStudentToClassRequest: {
            classId,
            email,
            section,
            group
          }
        });
      },
      listByClass: async (classId: number) => {
        const { students } = await generatedClient.getStudentsByClassId({ classId });
        return students?.map(it => ({
          studentId: it.studentId!,
          name: it.name!,
          section: it.section!,
          group: it.group!,
          imageUrl: it.picture,
          withdrawed: it.withdrawal!,
          score: it.score ?? 0,
          maxScore: it.maxScore!,
        } satisfies Student)) ?? [];
      },
      removeFromClass: async (classId: number, studentId: string) => {
        await generatedClient.removeStudentFromClass({
          removeStudentFromClassRequest: {
            classId,
            studentId
          }
        });
      },
      update: async (classId: number, studentId: string, { withdrawed, group, section }: UpdateStudentPayload) => {
        await generatedClient.updateStudentInfo({
          updateStudentInfoRequest: {
            classId,
            studentId,
            group,
            section,
            withdrawal: withdrawed
          }
        });
      },

      updateMany: async (classId: number, studentIds: string[], data: UpdateStudentPayload) => {
        // TODO: async queue maybe
        await Promise.all(
          studentIds.map(studentId =>
            generatedClient.updateStudentInfo({
              updateStudentInfoRequest: {
                classId,
                studentId,
                group: data.group,
                section: data.section,
                withdrawal: data.withdrawed
              }
            })
          )
        );
      },
    },
    classes: {
      getById: async (classId: number) => {
        const c = await generatedClient.getClassById({ classId });
        return toClass(c);
      },
      listParticipatingBySemester: async (semester: Semester) => {
        const { assistant, study } = await generatedClient.getParticipatingClassBySemester({ yearSemester: semester }); return {
          assisting: assistant?.map(toClass) ?? [],
          studying: study?.map(toClass) ?? []
        };
      },
      create: async ({ courseId, name, semester, image, students }: CreateClassPayload) => {
        await generatedClient.createClass({
          courseId: parseInt(courseId),
          name,
          semester,
          image,
          students
        });
      },
      update: async (classId: number, { courseId, image, name, semester, students }: UpdateClassPayload) => {
        unimplemented("หาย");
        // await generatedClient.classPatch({
        //   classId,
        //   courseId: courseId ? parseInt(courseId) : undefined,
        //   image,
        //   name,
        //   semester,
        //   students
        // });
      },
    },
    sections: {
      getByClass: async (classId: number) => {
        const { sections } = await generatedClient.getSectionsByClassId({ classId });
        return sections ?? [];
      }
    },
    semesters: {
      list: async () => {
        const { semesters } = await generatedClient.getSemesters();
        // TODO: validate formatting
        return (semesters ?? []) as Semester[];
      },
    },
    instructorsAndTAs: {
      listByClass: async (classId: number) => {
        const { assistant, instructor } = await generatedClient.getInstructorsByClassId({ classId }); return {
          instructors: instructor?.map(it => ({
            name: it.name!,
            imageUrl: it.picture,
            email: it.email!,
          }) satisfies Instructor) ?? [],
          teachingAssistant: assistant?.map(it => ({
            leader: it.leader!,
            name: it.name!,
            imageUrl: it.picture,
            email: it.email!,
          })) ?? []
        };
      },
      addToClass: async (classId: number, email: string) => {
        await generatedClient.addInstructorToClass({
          tAEditBody: {
            classId,
            email
          }
        });
      },
      removeFromClass: async (classId: number, email: string) => {
        await generatedClient.removeInstructorFromClass({
          tAEditBody: {
            classId,
            email
          }
        });
      },
    },
    assignments: {
      listNearDue: async () => {
        const { labs } = await generatedClient.getNearDues(); return labs?.map(it => ({
          id: it.labId!,
          due: parseDateTime(it.labDue!),
          name: it.labName!,
          courseName: it.courseName!,
          courseId: String(it.courseId!),
          // TODO: request classId for linking
          maxScore: it.labMaxScore!,
        } satisfies NearDueAssignment)) ?? [];
      },

      listByClass: async (classId: number) => {
        const labs = await generatedClient.getLabsByClassId({ classId });
        return labs.map((lab) => ({
          id: lab.labId!,
          name: lab.labName!,
          due: parseDateTime(lab.due!),
          publish: parseDateTime(lab.publish!),
          number: lab.labNumber!,
          score: lab.score ?? 0,
          status: toStatus(lab.status),
        } satisfies StudentAssignment));
      },

      listByClassI: async (classId: number) => {
        const labs = await generatedClient.getLabsByClassId({ classId });
        return labs.map((lab) => {
          return {
            id: lab.labId!,
            name: lab.labName!,
            due: parseDateTime(lab.due!),
            publish: parseDateTime(lab.publish!),
            number: lab.labNumber!,
          } satisfies InstructorAssignment;
        });
      },

      create: async (classId: number, p: CreateAssignmentPayload) => {
        await generatedClient.createLab({
          classId,
          labData: {
            assignTo: p.assignedGroupIds,
            closeOnDue: p.closeOnDue,


            // languageIds: p.languageIds,

            examMode: p.examMode,
            examPin: parseInt(p.examPin), // Convert string to number

            due: p.due.toString(), // ISO 8601 should be compatible with RFC 3339,
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

      update: async (labId: number, p: UpdateAssignmentPayload) => {
        await generatedClient.updateLab({
          labId,
          labData: {
            assignTo: p.assignedGroupIds,
            closeOnDue: p.closeOnDue,

            examMode: p.examMode,
            examPin: p.examPin ? parseInt(p.examPin) : undefined,

            due: p.due?.toString(),
            publish: p.publish?.toString(),

            name: p.name,
            number: p.number,
            questions: p.questions,
            showScoreOnLock: p.showScoreOnLock,
            testcase: p.testCode,
            secretTestcase: p.secretTestCode,
          }
        });
      },
      getById: async (labId: number) => {
        const lab = await generatedClient.getLabById({ labId });

        const questionPromises = (lab.questionIds ?? []).map(async questionId => client.questions.getById(questionId));
        const questions = await Promise.all(questionPromises);

        return {
          // Base assignment fields
          id: labId,
          name: lab.name!,
          due: parseDateTime(lab.due!),
          publish: parseDateTime(lab.publish!),
          number: lab.number!,
          // Student-specific fields
          score: 0, // TODO: get from user submission
          status: "new" as const, // TODO: compute status from submission data
          // Detail fields
          questions,
          // languages: lab.language!.map(it => ({ id: it.id!, name: it.name! })),
          assignedGroupIds: lab.assignTo ?? [],
          closeOnDue: lab.closeOnDue ?? false,
          examMode: lab.examMode ?? false,
          questionIds: lab.questionIds ?? [],
          additionalFileIds: lab.addfiles ?? [],
        } satisfies StudentAssignmentDetails;
      },

      getByIdI: async (labId: number) => {
        // TODO: refactor this to avoid code duplication
        const [lab, examPin] = await Promise.all([
          generatedClient.getLabById({ labId }),
          client.examPin.getByAssignmentId(labId),
        ]);

        const questionPromises = (lab.questionIds ?? []).map(async questionId => client.questions.getByIdI(questionId));
        const questions = await Promise.all(questionPromises);

        return {
          // Base assignment fields
          id: labId,
          name: lab.name!,
          due: parseDateTime(lab.due!),
          publish: parseDateTime(lab.publish!),
          number: lab.number!,
          // Detail fields
          questionIds: lab.questionIds ?? [],
          additionalFileIds: lab.addfiles ?? [],
          // languages: lab.language!.map(it => ({ id: it.id!, name: it.name! })),
          examMode: lab.examMode ?? false,
          closeOnDue: lab.closeOnDue ?? false,
          assignedGroupIds: lab.assignTo ?? [],
          questions,
          // Instructor-specific detail fields
          examPin: String(examPin ?? "000000"),
          showScoreOnLock: false,
          testCode: String(lab.testcase ?? ""), // wtf why did these exist on normal api too 
          secretTestCode: String(lab.secretTestcase ?? ""),
        } satisfies InstructorAssignmentDetails;
      },

      attachFile: async (assignmentId: number, file: File) => {
        throw new Error("not implemented");
      },

      downloadFile: async (fileId: number) => {
        const c = await generatedClient.getFileById({ addFileId: fileId });
        return c;
      },

      removeFile: async (fileId: number) => {
        await generatedClient.removeFile({
          addFileId: fileId
        });
      },
    },

    questions: {
      getById: async (questionId: number) => {
        const q = await generatedClient.getQuestionById({ questionId });

        return {
          id: questionId,
          description: q.description!,
          maxScore: q.maxScore!,
          name: q.name!,
          number: q.number!,
          template: q.predefine!,
          languages: [], // TODO: implement this once we have the api
          submission: q.submission && {
            id: q.submission.submissionId!,
            score: q.submission.score!,
            submittedAt: parseDateTime(q.submission.timestamp!)
          }
        };
      },

      getByIdI: async (questionId: number) => {
        const [q, testcaseData] = await Promise.all([
          client.questions.getById(questionId),
          client.testcase.listByQuestionId(questionId)
        ]);

        return {
          id: questionId,
          description: q.description!,
          maxScore: q.maxScore!,
          name: q.name!,
          number: q.number!,
          template: q.template!,
          languages: [], // TODO: get this when we have the api
          answer: "", // TODO: get instructor answer from API when available
          testCode: "", // TODO: get public test code when available
          secretTestCode: "", // TODO: get secret test code when available
          testcases: testcaseData.public,
          secretTestCases: testcaseData.secret,
        } satisfies InstructorQuestion;
      },

      async getSubmission(questionId) {
        const submission = await generatedClient.getCodeByQuestionId({ questionId });
        return {
          language: {
            id: submission.language!.id!,
            name: submission.language!.name!
          },
          submissionId: submission.submissionId!,
          code: submission.code.map(it => ({
            pageName: it.pageName!,
            content: it.content!,
          })),
        };
      },

      async submit(questionId, languageId, codes) {
        const { submissionId } = await generatedClient.submitCode({
          submitCodeRequest: {
            questionId,
            code: codes.map(it => ({
              pageName: it.pageName,
              content: it.content
            })),
            languageId
          }
        });

        return { submissionId: submissionId! };
      },

      async getSubmissionResult(submissionId) {
        const { normal, secret } = await generatedClient.getSubmissionResultBySubmissionId({ submissionId });
        return {
          public: normal?.map(it => ({
            input: it.input!,
            expectedOutput: it.output!,
            message: it.message!,
            status: it.status!,
          })) ?? [],
          secret: secret?.map(it => ({
            message: it.message!,
            status: it.status!,
          })) ?? []
        };
      },

      async requestGrade(submissionId) {
        await generatedClient.requestGrade({ requestGradeRequest: { submissionId } });
      },
    },
    supportedLanguages: {
      list: async () => {
        const response = await generatedClient.getSupportedLanguages();
        return response.languages?.map(lang => ({ id: lang.id!, name: lang.name! })) || [];
      },
    },
    groups: {
      listByClassId: async (classId: number) => {
        const { groups } = await generatedClient.getGroupsByClassId({ classId });
        return groups || [];
      },
    },
    examPin: {
      async getByAssignmentId(labId) {
        const { examPin } = await generatedClient.getExamPinByLabId({ labId });
        return String(examPin);
      },
    },
    testCode: {
      async getById(id) {
        const { testcase } = await generatedClient.getUnitTestById({ testCaseId: id });
        if (!testcase) {
          throw new Error("what");
        }
        return testcase;
      },
    },
    testcase: {
      async listByQuestionId(questionId) {
        const { secretTestcase, testcase } = await generatedClient.getTestcasesByQuestionId({ questionId });
        return {
          public: testcase?.map(it => ({ input: it.input!, output: it.output! })) ?? [],
          secret: secretTestcase?.map(it => ({ input: it.input!, output: it.output! })) ?? []
        };
      },
    }
  };

  return client;
};

