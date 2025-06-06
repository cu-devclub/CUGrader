import '@/lib/env-config';
import { unimplemented } from "../utils";
import { Configuration, DefaultApi, TAInfo, V1ClassPatchRequest, V1ClassPostRequest, type CreateStudent, type DeleteStudent, type EditStudent, type V1CallbackPostRequest } from "./generated";

const config = new Configuration({
    headers: {
        // cursed af
        get "Authentication"() {
            const token = "TODO: put it here";
            return `Bearer ${token}`;
        }
    },
    basePath: process.env.BACKEND_URL
});

const generatedClient = new DefaultApi(config);

export type Semester = `${number}/${number}`;

type CreateClassBody = Omit<V1ClassPostRequest, "authentication">;
type CreateClassRequestBody = CreateClassBody & {
    image?: File;
    /**
     * Student csv file, we can parse this from the client tho
     */
    students?: File;
    semester: Semester;
};

type EditClassBody = Omit<V1ClassPatchRequest, "authentication">;
type EditClassRequestBody = EditClassBody & {
    image?: File;
    /**
     * Student csv file
     */
    students?: File;
    semester?: Semester;
};


// well for now ,we have 16 routes - 1 for picture
export const client = {
    auth: {
        // call this first, save the state, redirect to the returned url
        login: () => generatedClient.v1LoginGet(),
        // after google redirect the user back to our site, then sent credentials and state to the server?
        getAccessToken: (body: V1CallbackPostRequest) => generatedClient
            .v1CallbackPost({ v1CallbackPostRequest: body })
            .then(it => it.accessToken),
    },

    listAssistantAndInstructor: () => generatedClient.v1TAGet({}),
    student: {
        list: () => generatedClient.v1StudentGet({}).then(it => it.students),
        addToClass: (classId: number, student: Omit<CreateStudent, "classId">) => generatedClient.v1StudentPost({
            createStudent: {
                classId,
                ...student
            }
        }),
        update: (classId: number, studentId: string, body: Omit<EditStudent, "classId" | "studentId">) => generatedClient.v1StudentPatch({
            editStudent: {
                classId,
                studentId,
                ...body
            }
        }),
        removeFromClass: (classId: number, studentId: string) => generatedClient.v1StudentDelete({
            deleteStudent: { classId, studentId }
        }),
    },
    semester: {
        list: () => generatedClient.v1ClassesSemestersGet().then(it => it.semesters ?? []),
    },
    group: {
        listByClass: (classId: number) => generatedClient.v1GroupClassIdGet({ classId }).then(it => it.groups ?? []),
    },
    class: {
        listBySemester: (semester: string) => generatedClient.v1ClassesClassesYearSemesterGet({ yearSemester: semester }),
        // TODO: make this multipart/form-data
        create: (body: CreateClassRequestBody) => generatedClient.v1ClassPost(body),
        edit: (classId: number, body: Omit<EditClassRequestBody, "classId">) => generatedClient.v1ClassPatch({
            classId,
            ...body
        }),
    },
    section: {
        listByClass: (classId: number) => generatedClient.v1SectionClassIdGet({ classId }).then(it => it.sections),
    },
    assistant: {
        listByClass: async (classId: number): Promise<TAInfo[]> => unimplemented("This api not yet exist."),
        addToClass: (classId: number, email: string) => generatedClient.v1TAPost({
            tAeditBody: {
                classId,
                email
            }
        }),
        removeFromClass: (classId: number, email: string) => generatedClient.v1TADelete({
            tAeditBody: {
                classId,
                email
            }
        }),
    },
};

