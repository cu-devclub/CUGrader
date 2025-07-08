import { CalendarDateTime, parseDateTime } from "@internationalized/date";
import { APIClient, SupportedLanguage } from "../type";
import { generateName } from "./name";
import { DbClass, InMemoryStorage, PersistenceStorage, Storage } from "./persistence";
import { seed } from "./seed";

interface Database {
  classes: DbClass[];
  assignments: DbAssignment[];
  questions: DbQuestion[];
}

interface DbAssignment {
  id: number;
  classId: number;
  number: number;
  name: string;
  publish: CalendarDateTime;
  due: CalendarDateTime;
  questionIds: number[];
  assignedGroupIds: string[];
  closeOnDue: boolean;
  examMode: boolean;
  additionalFileIds: number[];
  examPin: string;
  secretTestCode: string;
  showScoreOnLock: boolean;
  testCode: string;
}

interface DbQuestion {
  id: number;
  number: number;
  name: string;
  description: string;
  template: string;
  maxScore: number;
  answer: string;
  testCode: string;
  secretTestCode: string;
  testcases: { input: string; output: string; }[];
  secretTestCases: { input: string; output: string; }[];
  languageIds: number[];
}

function createClient(persistence: Storage<Database>): APIClient {
  let currentClassId = 420;
  let currentAssignmentId = 10;
  let currentQuestionId = 0;
  const classes = persistence.data.classes;
  const assignments = persistence.data.assignments;
  const questions = persistence.data.questions;

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
    },
    assignments: {
      listNearDue: async () => {
        const nearDueAssignments = assignments.filter(a => {
          const now = new Date();
          const due = a.due.toDate("UTC");
          const timeDiff = due.getTime() - now.getTime();
          return timeDiff > 0 && timeDiff <= 7 * 24 * 60 * 60 * 1000; // within 7 days
        });

        return nearDueAssignments.map(a => {
          const c = getClassById(a.classId);
          return {
            id: a.id,
            courseId: c.courseId,
            courseName: c.courseName,
            due: a.due,
            maxScore: 100,
            name: a.name
          };
        });
      },
      getById: async (labId) => {
        const assignment = assignments.find(a => a.id === labId);
        if (!assignment) throw new Error(`Assignment ${labId} not found`);

        const assignmentQuestions = await Promise.all(assignment.questionIds.map(id => client.questions.getById(id)));

        return {
          id: assignment.id,
          number: assignment.number,
          name: assignment.name,
          publish: assignment.publish,
          due: assignment.due,
          questions: assignmentQuestions,
          questionIds: assignment.questionIds,
          assignedGroupIds: assignment.assignedGroupIds,
          closeOnDue: assignment.closeOnDue,
          examMode: assignment.examMode,
          additionalFileIds: assignment.additionalFileIds,
          score: Math.floor(Math.random() * 100),
          status: "completed"
        };
      },

      getByIdI: async (labId) => {
        const assignment = assignments.find(a => a.id === labId);
        if (!assignment) throw new Error(`Assignment ${labId} not found`);

        const assignmentQuestions = await Promise.all(assignment.questionIds.map(id => client.questions.getByIdI(id)));

        return {
          id: assignment.id,
          number: assignment.number,
          publish: assignment.publish,
          due: assignment.due,
          name: assignment.name,
          questionIds: assignment.questionIds,
          assignedGroupIds: assignment.assignedGroupIds,
          closeOnDue: assignment.closeOnDue,
          examMode: assignment.examMode,
          additionalFileIds: assignment.additionalFileIds,
          examPin: assignment.examPin,
          secretTestCode: assignment.secretTestCode,
          showScoreOnLock: assignment.showScoreOnLock,
          testCode: assignment.testCode,
          questions: assignmentQuestions
        };
      },

      listByClass: async (classId) => {
        const classAssignments = assignments.filter(a => a.classId === classId);

        return classAssignments.map(a => ({
          id: a.id,
          number: a.number,
          publish: a.publish,
          due: a.due,
          name: a.name,
          score: Math.floor(Math.random() * 100),
          status: "due-soon" as const
        }));
      },

      listByClassI: async (classId) => {
        const classAssignments = assignments.filter(a => a.classId === classId);

        return classAssignments.map(a => ({
          id: a.id,
          number: a.number,
          publish: a.publish,
          due: a.due,
          name: a.name
        }));
      },

      create: async (classId, payload) => {
        const newAssignment: DbAssignment = {
          id: currentAssignmentId++,
          classId,
          number: payload.number,
          name: payload.name,
          publish: payload.publish,
          due: payload.due,
          questionIds: [],
          assignedGroupIds: payload.assignedGroupIds,
          closeOnDue: payload.closeOnDue,
          examMode: payload.examMode,
          additionalFileIds: [],
          examPin: payload.examPin,
          secretTestCode: payload.secretTestCode,
          showScoreOnLock: payload.showScoreOnLock,
          testCode: payload.testCode
        };

        // Create questions and link them
        const questionIds: number[] = [];
        for (let i = 0; i < payload.questions.length; i++) {
          const q = payload.questions[i];
          const newQuestion: DbQuestion = {
            id: currentQuestionId++,
            number: i + 1,
            name: q.name,
            description: q.description,
            template: q.template,
            maxScore: q.maxScore,
            answer: q.answer,
            testCode: q.testCode,
            secretTestCode: q.secretTestCode,
            testcases: q.testcases,
            secretTestCases: q.secretTestCases,
            languageIds: q.languageIds
          };
          questions.push(newQuestion);
          questionIds.push(newQuestion.id);
        }

        newAssignment.questionIds = questionIds;
        assignments.push(newAssignment);
        persistence.persist();
      },

      update: async (labId, payload) => {
        const assignment = assignments.find(a => a.id === labId);
        if (!assignment) throw new Error(`Assignment ${labId} not found`);

        if (payload.number !== undefined) assignment.number = payload.number;
        if (payload.name !== undefined) assignment.name = payload.name;
        if (payload.publish !== undefined) assignment.publish = payload.publish;
        if (payload.due !== undefined) assignment.due = payload.due;
        if (payload.assignedGroupIds !== undefined) assignment.assignedGroupIds = payload.assignedGroupIds;
        if (payload.closeOnDue !== undefined) assignment.closeOnDue = payload.closeOnDue;
        if (payload.examMode !== undefined) assignment.examMode = payload.examMode;
        if (payload.examPin !== undefined) assignment.examPin = payload.examPin;
        if (payload.secretTestCode !== undefined) assignment.secretTestCode = payload.secretTestCode;
        if (payload.showScoreOnLock !== undefined) assignment.showScoreOnLock = payload.showScoreOnLock;
        if (payload.testCode !== undefined) assignment.testCode = payload.testCode;

        persistence.persist();
      },

      attachFile: async (assignmentId: number, file: File) => {
        const assignment = assignments.find(a => a.id === assignmentId);
        if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);
        const fileId = await persistence.saveFile(file);
        assignment.additionalFileIds.push(parseInt(fileId));
        persistence.persist();
      },

      removeFile: async (fileId) => {
        await persistence.deleteFile(String(fileId));
        persistence.persist();
      },

      downloadFile: async (fileId) => {
        return new Blob([`This is file ${fileId}`], {
          type: "text/plain"
        });
      },
    },

    questions: {
      getById: async (questionId) => {
        const question = questions.find(q => q.id === questionId);
        if (!question) throw new Error(`Question ${questionId} not found`);

        // Map languageIds to supported languages for StudentQuestion
        const supportedLanguages = await client.supportedLanguages.list();
        const languages = question.languageIds
          .map(id => supportedLanguages.find(lang => lang.id === id))
          .filter((lang): lang is SupportedLanguage => lang !== undefined);

        return {
          id: questionId,
          number: question.number,
          name: question.name,
          description: question.description,
          template: question.template,
          maxScore: question.maxScore,
          languages,
        };
      },

      getByIdI: async (questionId) => {
        const question = questions.find(q => q.id === questionId);
        if (!question) throw new Error(`Question ${questionId} not found`);

        // Map languageIds to supported languages for InstructorQuestion
        const supportedLanguages = await client.supportedLanguages.list();
        const languages = question.languageIds
          .map(id => supportedLanguages.find(lang => lang.id === id))
          .filter((lang): lang is SupportedLanguage => lang !== undefined);

        return {
          ...question,
          languages,
        };
      },

      submit: async (questionId, languageId, codes) => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { submissionId: Math.floor(Math.random() * 1000) + 1 };
      },

      getSubmission: async (questionId) => {
        return {
          submissionId: Math.floor(Math.random() * 1000) + 1,
          code: [
            {
              pageName: "main.ts",
              content: "console.log('Hello, World!')"
            }
          ],
          language: {
            id: 6,
            name: "Typescript"
          }
        };
      },

      requestGrade: async (submissionId) => {
        console.log(`[mock] Requesting grade for submission ${submissionId}`);
      },

      getSubmissionResult: async (submissionId) => {
        return {
          public: [
            {
              input: "test input",
              output: "output",
              message: "Test passed",
              status: "pass" as const
            }
          ],
          secret: [
            {
              message: "Secret test passed",
              status: "pass" as const
            }
          ]
        };
      },
    },
    sections: {
      getByClass: async (classId) => {
        const c = getClassById(classId);
        return [...new Set(c.students.map(it => it.section))];
      },
    },

    supportedLanguages: {
      list: async () => {
        return [
          { id: 1, name: "Python 3" },
          { id: 2, name: "C++" },
          { id: 3, name: "C" },
          { id: 4, name: "Java" },
          { id: 5, name: "JavaScript" },
          { id: 6, name: "TypeScript" },
          { id: 7, name: "Swift" },
          { id: 8, name: "Haskell" },
          { id: 9, name: "Rust" },
          { id: 10, name: "Zig" },
          { id: 11, name: "Kotlin" },
          { id: 12, name: "Erlang" },
          { id: 13, name: "Gleam" },
        ];
      }
    },

    groups: {
      listByClassId: async (classId) => {
        const c = getClassById(classId);
        const groups = c.students.map(it => it.group);
        return [...new Set(groups)];
      },
    },

    examPin: {
      getByAssignmentId: async (assignmentId: number) => {
        const assignment = assignments.find(a => a.id === assignmentId);
        return assignment?.examPin || "123456";
      }
    },

    testCode: {
      getById: async (testCodeId: number) => {
        const assignment = assignments.find(a => a.id === testCodeId);
        return assignment?.testCode || "test code content";
      }
    },

    testcase: {
      listByQuestionId: async (questionId: number) => {
        const question = questions.find(q => q.id === questionId);
        return {
          public: question?.testcases || [{ input: "public in", expectedOutput: "public out" }],
          secret: question?.secretTestCases || [{ input: "secret in", expectedOutput: "secret out" }],
        };
      }
    }
  };

  return client;
}


const preserveMockState = process.env.NEXT_PUBLIC_MOCK_PRESERVE_STATE === "true";

export async function createMockClient() {
  const initialData: Database = {
    classes: [],
    assignments: [],
    questions: []
  };
  const storage = preserveMockState
    ? new PersistenceStorage("default", initialData)
    : new InMemoryStorage(initialData);

  const client = createClient(storage);

  if (storage.data.classes.length === 0 || !globalThis.window) {
    await seed(client);
  }

  return client;
}