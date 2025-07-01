import { parseDateTime } from "@internationalized/date";
import { ClassObject, Configuration, DefaultApi } from "./generated";
import { LabsClassIdGet200ResponseInnerStatusEnum } from "./generated/models/LabsClassIdGet200ResponseInner";
import { APIClient, AssignmentStatus, Class, CreateAssignmentPayload, CreateClassPayload, CreateStudentPayload, Instructor, InstructorAssignment, InstructorAssignmentDetails, InstructorQuestion, NearDueAssignment, Semester, Student, StudentAssignment, StudentAssignmentDetails, UpdateAssignmentPayload, UpdateClassPayload, UpdateStudentPayload } from "./type";
import { getCookie } from "cookies-next/client";

function toClass(input: ClassObject): Class {
  return {
    classId: input.classId!,
    courseId: String(input.courseId!),
    courseName: input.courseName!,
    imageUrl: input.image
  };
}

function toStatus(status: LabsClassIdGet200ResponseInnerStatusEnum | undefined): AssignmentStatus {
  switch (status) {
    case LabsClassIdGet200ResponseInnerStatusEnum.New:
      return "new";
    case LabsClassIdGet200ResponseInnerStatusEnum.PartialComplete:
      return "partially-completed";
    case LabsClassIdGet200ResponseInnerStatusEnum.Complete:
      return "completed";
    case LabsClassIdGet200ResponseInnerStatusEnum.Late:
      return "lated";
    case LabsClassIdGet200ResponseInnerStatusEnum.DueSoon:
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
        await generatedClient.studentPost({
          createStudent: {
            classId,
            email,
            section,
            group
          }
        });
      },
      listByClass: async (classId: number) => {
        const { students } = await generatedClient.studentClassIdGet({ classId });
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
        await generatedClient.studentDelete({
          deleteStudent: {
            classId,
            studentId
          }
        });
      },
      update: async (classId: number, studentId: string, { withdrawed, group, section }: UpdateStudentPayload) => {
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

      updateMany: async (classId: number, studentIds: string[], data: UpdateStudentPayload) => {
        // TODO: async queue maybe
        await Promise.all(
          studentIds.map(studentId =>
            generatedClient.studentPatch({
              editStudent: {
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
        const c = await generatedClient.classClassIdGet({ classId });
        return toClass(c);
      },
      listParticipatingBySemester: async (semester: Semester) => {
        const { assistant, study } = await generatedClient.classesClassesYearSemesterGet({ yearSemester: semester }); return {
          assisting: assistant?.map(toClass) ?? [],
          studying: study?.map(toClass) ?? []
        };
      },
      create: async ({ courseId, name, semester, image, students }: CreateClassPayload) => {
        await generatedClient.classPost({
          courseId: parseInt(courseId),
          name,
          semester,
          image,
          students
        });
      },
      update: async (classId: number, { courseId, image, name, semester, students }: UpdateClassPayload) => {
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
      getByClass: async (classId: number) => {
        const { sections } = await generatedClient.sectionClassIdGet({ classId });
        return sections ?? [];
      }
    },
    semesters: {
      list: async () => {
        const { semesters } = await generatedClient.classesSemestersGet();
        // TODO: validate formatting
        return (semesters ?? []) as Semester[];
      },
    },
    instructorsAndTAs: {
      listByClass: async (classId: number) => {
        const { assistant, instructor } = await generatedClient.tAClassIdGet({ classId }); return {
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
        await generatedClient.tAPost({
          tAeditBody: {
            classId,
            email
          }
        });
      },
      removeFromClass: async (classId: number, email: string) => {
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
        const { labs } = await generatedClient.nearDueDateGet(); return labs?.map(it => ({
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
        const labs = await generatedClient.labsClassIdGet({ classId });
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
        const labs = await generatedClient.labsClassIdGet({ classId });
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
        await generatedClient.labPost({
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
        await generatedClient.labPatch({
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
        const lab = await generatedClient.labLabIdGet({ labId });

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
          generatedClient.labLabIdGet({ labId }),
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
        const c = await generatedClient.addfileAddfileIdGet({ addfileId: fileId });
        return c;
      },

      removeFile: async (fileId: number) => {
        await generatedClient.addfileAddfileIdDelete({
          addfileId: fileId
        });
      },
    },

    questions: {
      getById: async (questionId: number) => {
        const q = await generatedClient.questionQuestionIdGet({ questionId });

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
        const submission = await generatedClient.codeQuestionIdGet({ questionId });
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
        const { submissionId } = await generatedClient.codePost({
          codePostRequest: {
            questionId,
            code: codes.map(it => ({
              pageName: it.pageName,
              content: it.content
            })),
            languageId
          }
        });

        return { submissionId };
      },

      async getSubmissionResult(submissionId) {
        const { normal, secret } = await generatedClient.resultSubmissionIdGet({ submissionId });
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
        const response = await generatedClient.languageGet();
        return response.languages?.map(lang => ({ id: lang.id!, name: lang.name! })) || [];
      },
    },
    groups: {
      listByClassId: async (classId: number) => {
        const response = await generatedClient.groupClassIdGet({ classId });
        return response || [];
      },
    },
    examPin: {
      async getByAssignmentId(assignmentId) {
        const { examPin } = await generatedClient.examPinLabIdGet({ labId: assignmentId });
        return String(examPin);
      },
    },
    testCode: {
      async getById(testCodeId) {
        const { testcase } = await generatedClient.testcaseTestcaseIdGet({ testcaseId: testCodeId });
        return testcase!;
      },
    },
    testcase: {
      async listByQuestionId(questionId) {
        const { secretTestcase, testcase } = await generatedClient.multilangTestcaseQuestionIdGet({ questionId }); return {
          public: testcase?.map(it => ({ input: it.input!, output: it.output! })) ?? [],
          secret: secretTestcase?.map(it => ({ input: it.input!, output: it.output! })) ?? []
        };
      },
    }
  };

  return client;
};

