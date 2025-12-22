// Types defining the input/output contracts
export type ExerciseInput = {
    index: number
    type: string
    mode: string
    questionText: string
    bankTokens: string[]
    solutionTokens: string[]
}

export type GeneratedLesson = {
    title: string
    exercises: ExerciseInput[]
}

export type Exercise = {
    id: string;
    index: number;
    type: string;
    mode: string;
    questionText: string;
    bankTokens: string[] | string;
    solutionTokens: string[] | string;
};

export type Lesson = {
    id: string;
    title: string;
    exercises: Exercise[];
};