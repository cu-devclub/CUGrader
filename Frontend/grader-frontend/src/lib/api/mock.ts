import { APIClient, Class, Instructor, Semester, Student, TeachingAssistant } from "./type";

type DbClass = Omit<Class, "imageUrl"> & {
  students: DbStudent[];
  semester: Semester; // TODO: move this to normal api response later
  assistants: DbAssistant[];
  instructors: DbInstructor[];

  imageFileId?: number;
};

type DbStudent = Omit<Student, "maxScore" | "imageUrl"> & {
  imageFileId?: number;
};
type DbInstructor = Omit<Instructor, ""> & {
  email: string;
  imageFileId?: number;
};
type DbAssistant = TeachingAssistant & {
  email: string;
  imageFileId?: number;
};

function choice<T>(elements: T[]): T {
  const index = Math.floor(Math.random() * elements.length);
  return elements[index];
}

const firstNames = [
  "Arjun", "Ayse", "Wei", "Carlos", "Erik", "Muhammad", "Satya", "Thaksin", "Ivan", "Hiroshi", "Joon", "Pierre", "Hans", "Marco", "Pedro", "Dirk", "Kwame", "Ryan", "Mehmet", "Mei", "Maria", "Astrid", "Azhar", "Priya", "Siriporn", "Anastasia", "Yuki", "Soo", "Marie", "Greta", "Giulia", "Ana", "Anouk", "Ama", "Shah", "Fatma", "Jun", "Diego", "Lars", "Omar", "Raj", "Somchai", "Dmitri", "Takeshi", "Min", "Jean", "Klaus", "Andrea", "Joao", "Pieter", "Kofi", "May", "Kemal", "Ling", "Ana", "Ingrid", "Fatima", "Kavya", "Anchalee", "Ksenia", "Sakura", "Hye", "Camille", "Ingrid", "Francesca", "Mariana", "Femke", "Akosua", "Thomas", "Zeynep", "Hao", "Luis", "Nils", "Hassan", "Vikram", "Kittipong", "Nikolai", "Kenji", "Sung", "Antoine", "Wolfgang", "Luca", "Carlos", "Willem", "Ebo", "Erdogan", "Ahmet", "Yan", "Carmen", "Sigrid", "Aisha", "Ananya", "Jirayu", "Svetlana", "Akiko", "Jin", "Claire", "Brigitte", "Chiara", "Fernanda", "Sanne", "Efua", "Taylor", "Elif", "Ming", "Miguel", "Bjorn", "Ali", "Rohan", "Niran", "Pavel", "Taro", "Kyung", "Louis", "Gunter", "Matteo", "Ricardo", "Joris", "Adaora", "Martin", "Mustafa", "Xiao", "Isabel", "Solveig", "Khadija", "Shreya", "Apinya", "Olga", "Emiko", "Young", "Amelie", "Ursula", "Valentina", "Beatriz", "Lotte", "Chike", "Francis", "Selin", "Lei", "Jose", "Magnus", "Ahmed", "Aarav", "Chalerm", "Sergei", "Satoshi", "Ho", "Nicolas", "Friedrich", "Alessandro", "Bruno", "Bram", "Amara", "Leo", "Fang", "Rosa", "Freya", "Zara", "Diya", "Wipada", "Natasha", "Michiko", "Mi", "Chloe", "Marlene", "Martina", "Camila", "Roos", "Sekou", "Evan", "Chen", "Juan", "Olaf", "Yusuf", "Ravi", "Boris", "Kazuki", "Seok", "Julien", "Heinrich", "Francesco", "Rafael", "Zara", "James", "Li", "Elena", "Linnea", "Layla", "Meera", "Irina", "Naomi", "Eun", "Emma", "Petra", "Silvia", "Juliana", "Malik", "Emma", "Zhang", "Pablo", "Ibrahim", "Pooja", "Viktor", "Gabriel", "Aminata", "Oliver", "Yang", "Sofia", "Nour", "Karan", "Elena", "Lea", "Bakari", "Sophie", "Jorge", "Khalid", "Riya", "Maxim", "William", "Lucia", "Amina", "Daria", "Charlotte", "Benjamin", "Amelia", "Alexander", "Isabella", "Narendra", "Sebastian", "Victoria", "Katherine", "David", "Grace", "Matthew", "Lucy", "Daniel", "Sophia", "Michael", "Celia", "Anthony", "Beatrice", "Christopher", "Diana", "Joseph", "Vanessa", "Andrew", "Stephanie", "Joshua", "Monica", "Jonathan", "Angela", "Timothy", "Rebecca", "Kevin", "Amanda", "Nicholas", "Michelle", "Steven", "Laura", "Brian", "Sarah", "Edward", "Jennifer", "Ronald", "Lisa", "Kenneth", "Nancy", "Paul", "Karen", "Mark", "Betty", "Donald", "Helen", "George", "Sandra", "Akira", "Yuki", "Haruto", "Aoi", "Ren", "Hana", "Sora", "Mio", "Riku", "Yui", "Yamato", "Rina", "Kaito", "Saki", "Daiki", "Emi", "Shota", "Kanade", "Yuto", "Ai", "Kota", "Rio", "Hayato", "Moe", "Ryusei", "Nana", "Itsuki", "Yuna", "Yuuto", "Sara", "Minato", "Rena", "Asahi", "Kanna", "Raghav", "Ishita", "Rohit", "Aditi", "Siddharth", "Ishika", "Varun", "Tanvi", "Aditya", "Aarohi", "Akash", "Saanvi", "Ayaan", "Diya", "Vihan", "Ananya", "Reyansh", "Kiara", "Nihal", "Pihu", "Fernando", "Isabella", "Alejandro", "Camila", "Santiago", "Valentina", "Matias", "Martina", "Sebastian", "Lucia", "Nicolas", "Emilia", "Diego", "Victoria", "Gabriel", "Antonella", "Joaquin", "Regina", "Samuel", "Renata", "Lorenzo", "Amanda", "Francisco", "Carolina", "Adrian", "Fernanda", "Emilio", "Daniela"
];

const lastNames = [
  "Smith", "Kowalski", "Shinawatra", "Wang", "Singh", "Kim", "Nguyen", "Garcia", "Mueller", "Martin", "Rossi", "Volkov", "De Jong", "Silva", "Andersson", "Ozkan", "Hassan", "Okafor", "Brown", "Nowak", "Chonburi", "Li", "Sharma", "Tanaka", "Lee", "Tran", "Yoisaki", "Rodriguez", "Schmidt", "Bernard", "Russo", "Petrov", "Jansen", "Santos", "Johansson", "Kaya", "Mohamed", "Adebayo", "Williams", "Wisniewski", "Pattaya", "Zhang", "Patel", "Suzuki", "Park", "Le", "Martinez", "Schneider", "Dubois", "Ferrari", "Kuznetsov", "Van den Berg", "Oliveira", "Karlsson", "Demir", "Ahmed", "Ogilvie", "Miller", "Wojcik", "Sarawut", "Liu", "Kumar", "Takahashi", "Choi", "Pham", "Hernandez", "Fischer", "Thomas", "Esposito", "Morozov", "Van Dijk", "Souza", "Nilsson", "Sahin", "Ali", "Mwangi", "Anderson", "Kowalczyk", "Rattanakorn", "Chen", "Gupta", "Watanabe", "Jung", "Hoang", "Lopez", "Weber", "Robert", "Bianchi", "Novak", "Bakker", "Rodrigues", "Eriksson", "Celik", "Omar", "Kone", "Watson", "Kaminski", "Siriporn", "Yang", "Agarwal", "Ito", "Kang", "Phan", "Gonzalez", "Meyer", "Richard", "Romano", "Pavlov", "Janssen", "Ferreira", "Larsson", "Yilmaz", "Mahmoud", "Diallo", "Doe", "Lewandowski", "Wongsawat", "Huang", "Verma", "Yamamoto", "Cho", "Vu", "Perez", "Wagner", "Petit", "Colombo", "Sokolov", "Visser", "Alves", "Olsson", "Aydin", "Ibrahim", "Traore", "Johnson", "Zielinski", "Phakdee", "Zhao", "Jain", "Nakamura", "Yoon", "Dang", "Sanchez", "Becker", "Durand", "Ricci", "Mikhailov", "Smit", "Pereira", "Persson", "Ozdemir", "Yusuf", "Ouedraogo", "Davis", "Szymanski", "Chaiyaporn", "Wu", "Yadav", "Kobayashi", "Jang", "Bui", "Ramirez", "Schulz", "Leroy", "Marino", "Fedorov", "Meijer", "Lima", "Svensson", "Arslan", "Khalil", "Sawadogo", "Wilson", "Wozniak", "Rattanaporn", "Zhou", "Chauhan", "Kato", "Lim", "Do", "Cruz", "Hoffmann", "Moreau", "Greco", "Kozlov", "Boer", "Gomes", "Gustafsson", "Dogan", "Mansour", "Kabore", "Moore", "Xu", "Shah", "Yoshida", "Han", "Ho", "Flores", "Schaefer", "Simon", "Bruno", "Stepanov", "Mulder", "Ribeiro", "Pettersson", "Kilic", "Farah", "Sankara", "Taylor", "Sun", "Mehta", "Yamada", "Oh", "Ngo", "Gomez", "Koch", "Laurent", "Gallo", "Nikolaev", "De Vries", "Carvalho", "Jonsson", "Aslan", "Nasser", "Coulibaly", "Clark", "Ma", "Reddy", "Sasaki", "Seo", "Duong", "Diaz", "Richter", "Lefebvre", "Conti", "Orlov", "Van der Meer", "Barbosa", "Jansson", "Cakir", "Saleh", "Sidibe", "Lewis", "Zhu", "Nair", "Yamaguchi", "Shin", "Ly", "Reyes", "Klein", "Michel", "De Luca", "Andreev", "Hendriks", "Martins", "Hansson", "Eren", "Rashid", "Keita", "Walker", "Hu", "Iyer", "Matsumoto", "Kwon", "Morales", "Wolf", "Garcia", "Mancini", "Makarov", "De Groot", "Rocha", "Bengtsson", "Bozkurt", "Said", "Camara", "Hall", "Guo", "Chopra", "Inoue", "Hwang", "Jimenez", "Schroeder", "David", "Costa", "Zakharov", "Costa", "Lindberg", "Kurt", "Abdel", "Toure", "Young", "He", "Malhotra", "Min", "Ruiz", "Neumann", "Bertrand", "Giordano", "Fernandes", "Koc", "Mustafa", "King", "Lin", "Bansal", "Song", "Gutierrez", "Schwarz", "Roux", "Rizzo", "Almeida", "Korkmaz", "Bakr", "Wright", "Luo", "Hong", "Hill", "Gao", "Ahn"
];

export function generateName() {
  return `${choice(firstNames)} ${choice(lastNames)}`;
}

export const files: Map<number, File> = new Map();

// TODO: env
export const useMockServer = process.env.NEXT_PUBLIC_MOCK_PRESERVE_STATE === "true";
function getImageUrl(id: number | undefined) {
  if (!id) {
    return "";
  }
  if (useMockServer) {
    return `/api/dev/file?fileId=${id}`;
  } else {
    return URL.createObjectURL(files.get(id)!);
  }
}

function createClient(): APIClient {
  const classes: DbClass[] = [];

  let currentClassId = 420;

  function getClassById(id: number) {
    const target = classes.find(it => it.classId === id);
    if (!target) {
      throw new Error(`${id} class not found`);
    }
    return target;
  }

  async function init() {
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
      },
      async listByClass(classId) {
        return getClassById(classId).students.map(it => ({
          ...it,
          imageUrl: getImageUrl(it.imageFileId),
          maxScore: 100,
        }));
      },
      async removeFromClass(classId, studentId) {
        const target = getClassById(classId);
        target.students = target.students.filter(it => it.studentId !== studentId);
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
      },
    },
    classes: {
      async create({ courseId, name, semester, image, students }) {
        if (students) {
          console.warn("[mock] Ignoring students csv file");
        }
        const fileId = image ? Date.now() : undefined;
        if (image) {
          files.set(fileId!, image);
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
      },
      async getById(classId) {
        const c = getClassById(classId);
        return {
          ...c,
          imageUrl: getImageUrl(c.imageFileId)
        };
      },
      async listParticipatingBySemester(semester) {
        return {
          assisting: classes.filter(it => it.semester === semester).map(it => ({ ...it, imageUrl: getImageUrl(it.imageFileId) })),
          studying: classes.filter(it => it.semester === semester).map(it => ({ ...it, imageUrl: getImageUrl(it.imageFileId) }))
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
          const id = Date.now();
          files.set(id, payload.image);
          target.imageFileId = id;
        }
        if (payload.students) {
          console.warn("[mock] Ignoring students csv file");
        }
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
      },
      async removeFromClass(classId, email) {
        const target = getClassById(classId);
        target.instructors = target.instructors.filter(it => it.email !== email);
        target.assistants = target.assistants.filter(it => it.email !== email);
      },
    },
    semesters: {
      list: async () => {
        const s = classes.map(it => it.semester);
        return [...new Set(s)]; // remove duplicated
      }
    }
  };

  init();
  return client;
}


// TODO: handle file upload

type Leaves<T> = T extends object
  ? {
    [K in keyof T]: `${Exclude<K, symbol>}${Leaves<T[K]> extends never ? "" : `.${Leaves<T[K]>}`}`;
  }[keyof T]
  : never;

export interface MockRPCCommand {
  command: Leaves<APIClient>,
  params: any[];
}

export const api = createClient();

export async function dispatch({ command, params }: MockRPCCommand) {
  const path = command.split(".");
  // console.log({ api, path });
  let fn = api as any;
  while (path.length !== 0) {
    fn = fn[path.shift()!];
  }
  return await fn(...params);
}
