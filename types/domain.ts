// Types defining the input/output contracts
export type Exercise = {
    id?: string;
    index: number;
    type: string;
    mode: string;
    questionText: string;
    solutionTokens: string;
    distractorTokens: string;
};

export type Lesson = {
    id?: string;
    title: string;
    exercises: Exercise[];
};