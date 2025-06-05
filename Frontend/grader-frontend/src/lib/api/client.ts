import { Configuration, DefaultApi, type CreateClassBody, type CreateStudent, type DeleteStudent, type EditClassBody, type EditStudent, type V1CallbackPostRequest } from "./generated";

const config = new Configuration({
    headers: {
        // very cursed, or should i just recreate the entire thing 
        // and then just `const api = useApi()`
        get "Authentication"() {
            const token = "TODO: put it here";
            return `Bearer ${token}`;
        }
    }
});

const generatedClient = new DefaultApi(config);

export interface StudentInClassSelector {
    classId: number;
    studentId: string;
}

// well we have around 15 route - 1 for picture
export const client = {
    auth: {
        // call this first, save the state, redirect to the returned url
        login: () => generatedClient.v1LoginGet(),
        // after google redirect the user back to our site, then sent credentials and state to the server?
        // wtf why
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
        update: (selector: StudentInClassSelector, body: Omit<EditStudent, "classId" | "studentId">) => generatedClient.v1StudentPatch({
            editStudent: {
                ...selector,
                ...body
            }
        }),
        removeFromClass: ({ classId, studentId }: DeleteStudent) => generatedClient.v1StudentDelete({
            deleteStudent: { classId, studentId }
        }),
    },
    semester: {
        list: () => generatedClient.v1ClassesSemestersGet().then(it => it.semesters ?? [])
    },
    group: {
        listByClass: (classId: number) => generatedClient.v1GroupClassIdGet({ classId }).then(it => it.groups ?? []),
    },
    class: {
        listBySemester: (semester: string) => generatedClient.v1ClassesClassesYearSemesterGet({ yearSemester: semester }),
        create: (body: CreateClassBody) => generatedClient.v1ClassPost({
            createClassBody: body
        }),
        edit: (classId: number, body: Omit<EditClassBody, "classId">) => generatedClient.v1ClassPatch({
            editClassBody: {
                classId,
                ...body
            }
        }),
    },
    assistant: {
        listByClass: (classId: number) => generatedClient.v1SectionClassIdGet({ classId }),
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

