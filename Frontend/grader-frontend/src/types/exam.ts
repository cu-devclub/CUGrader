export enum ButtonState {
    UNPUBLIC = "Unpublished",
    START = "start",
    DISABLE = "done"
}

export interface DataExamProps {
    name: string;
    publicDate: string;
    examTime: string;
    examDuration: string;
    score: number;
    maxScore: number;
}

export interface HearderExam{
    dataExam: DataExamProps;
    state: ButtonState;
    onClick: () => void;
}