import { client } from "./client";

export const mockClient: typeof client = {
    student: {
        list: async () => [
            {
                name: "kim jong un",
                maxScore: 12,
                score: 12,
                picture: "",
                section: 1,
                studentId: "111111",
                withdrawal: false,
                group: "45"
            }
        ],
    }
};
