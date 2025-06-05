import { unimplemented } from "../utils";
import { client, Semester } from "./client";
import { ClassObject, InstructorInfo, StudentInfo, TAInfo } from "./generated";

const fileRegistry: File[] = [];

// why is there both id and classId, assuming its courseId
type Class = Omit<ClassObject, "classId"> & {
    students: Student[];
    courseId: string;
    semester: Semester;
    assistants: Assistant[]; // email
};

type Student = Omit<StudentInfo, "maxScore">;
type Instructor = InstructorInfo;
type Assistant = TAInfo & {
    email: string;
};


const classes: Class[] = [
    {
        id: 0,
        courseId: "1213",
        className: "Test",
        image: "",
        semester: "2025/1",
        assistants: [
            {
                name: generateName(),
                email: "ta@test.com",
                leader: true,
                picture: ""
            }
        ],
        students: [
            {
                name: generateName(),
                group: "default",
                picture: "",
                score: 12,
                section: 1,
                studentId: "111111",
                withdrawal: false
            }
        ]
    }
];
const instructors: Instructor[] = [
    {
        name: "John Instructor",
        picture: "",
    }
];
// const sections = ["2025/1", "2024/2", "2024/1"];
const semesters: Semester[] = ["2025/1", "2024/2", "2024/1"];

const currentUser = {};

let currentClassId = 10;

function capFirst(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min;
}

const firstNames = ["Arjun", "Ryan", "Shah", "May", "Thomas", "Erdogan", "Taylor", "Muhammad", "Martin", "Azhar", "Thaksin", "Ivan", "Francis", "Leo", "Haruka", "Evan", "Satya",];
const lastNames = ["Smith", "Brown", "Williams", "Shinawatra", "Miller", "Wang", "Kowalski", "Anderson", "Ryan", "Singh", "Watson", "Yoisaki", "Doe", "Li", "Kim", "Nguyen"];

function generateName() {
    const name = capFirst(firstNames[getRandomInt(0, firstNames.length + 1)]) + ' ' + capFirst(lastNames[getRandomInt(0, lastNames.length + 1)]);
    return name;
}

function getClassById(id: number) {
    const target = classes.find(it => it.id === id);
    if (!target) {
        throw new Error("Not found");
    }
    return target;
}

export const mockClient: typeof client = {
    student: {
        list: async () => classes
            .map(it => it.students)
            .flat()
            .map(it => ({ ...it, maxScore: 100 })), // mock until we implement submission
        addToClass: async (classId, student) => {
            const target = getClassById(classId);
            const { email, section, group } = student;
            target.students.push({
                studentId: email.split("@")[0],
                group: group ?? "default",
                name: generateName(),
                score: 0,
                picture: "",
                section,
                withdrawal: false
            });
            return {};
        },
        removeFromClass: async (classId, studentId) => {
            const target = getClassById(classId);
            target.students = target.students.filter(it => it.studentId !== studentId);
            return {};
        },
        update: async (classId, studentId, body) => {
            const target = getClassById(classId);
            const student = target.students.find(it => it.studentId === studentId);
            if (!student) {
                throw new Error("student not found");
            }
            if (body.group) {
                student.group = body.group;
            }
            if (body.section) {
                student.section = body.section;
            }
            if (body.withdrawal) {
                student.withdrawal = body.withdrawal;
            }

            return {};
        }
    },
    assistant: {
        addToClass: async (classId, email) => {
            const target = getClassById(classId);
            target.assistants.push({
                email,
                leader: false,
                name: generateName(),
                picture: "" // TODO: default pic
            });
            return {};
        },
        listByClass: async (classId) => {
            const target = getClassById(classId);
            return target.assistants;
        },
        removeFromClass: async (classId, email) => {
            const target = getClassById(classId);
            target.assistants = target.assistants.filter(it => it.email !== email);
            return {};
        }
    },
    auth: {
        // we cant really do much about it 
        login: async () => unimplemented("auth is hard to mock"),
        getAccessToken: async () => unimplemented("auth is hard to mock"),
    },
    class: {
        create: async ({ courseId, name, semester, image, students }) => {
            // TODO: parse csv maybe?
            if (students) {
                console.warn("[mock] Ignoring students csv file");
            }
            if (image) {
                fileRegistry.push(image);
            }
            classes.push({
                courseId: String(courseId), // dafaq
                className: name,
                id: currentClassId++,
                // TODO: better fallback image
                image: image ? URL.createObjectURL(image) : "",
                students: [],
                semester,
                assistants: []
            });
            return {};
        },
        edit: async (id, body) => {
            const target = getClassById(id);

            if (body.courseId) {
                target.courseId = String(body.courseId);
            }
            if (body.name) {
                target.className = body.name;
            }
            if (body.semester) {
                target.semester = body.semester;
            }
            if (body.image) {
                fileRegistry.push(body.image);
                target.image = URL.createObjectURL(body.image);
            }

            return {};
        },
        listBySemester: async (semester) => {
            return unimplemented("TODO: fix inconsistent type");
            // return {
            //     assistant: classes.map(it => ({ ...it, classId: it.courseId })),
            //     study: classes.map(it => ({ ...it, classId: it.courseId }))
            // };
        }
    },
    group: {
        listByClass: async (classId) => {
            // idk tho
            const target = getClassById(classId);
            const groups = target.students.map(it => it.group);
            const deduped = [...new Set(groups)];
            return deduped;
        }
    },
    listAssistantAndInstructor: async () => {
        const assistant = classes.map(it => it.assistants).flat();
        return {
            assistant,
            instructor: instructors
        };
    },
    section: {
        listByClass: async (classId) => unimplemented()
    },
    semester: {
        list: async () => {
            const s = classes.map(it => it.semester);
            return [...new Set(s)]; // remove duplicated
        }
    }
};
