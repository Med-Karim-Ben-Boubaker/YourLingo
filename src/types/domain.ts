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

export type CreateLessonRequest = { userPrompt: string };
export type CreateLessonResponse = { lessonId: string; title: string };
export type GetLessonResponse = { lesson: LessonDTO; exercises: ExerciseDTO[] };

export type LessonDTO = { id: string; title: string; contentSourceId: string };
export type ExerciseDTO = Exercise;

export type LessonActionError = { message: string; code: string };