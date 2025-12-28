export type Exercise = {
    id?: string;
    index: number;
    type: string;
    mode: string;
    questionText: string;
    solutionTokens: string;
    distractorTokens: string;
    sourceLanguage?: string;
    targetLanguage?: string;
};

export type Lesson = {
    id?: string;
    title: string;
    exercises: Exercise[];
};

export type DifficultyLevel = "A1" | "A2" | "B1" | "B2";

export const DIFFICULTY_LEVELS = ["A1", "A2", "B1", "B2"] as const;

export const DEFAULT_GENERATION_PARAMS = {
    minExercises: 1,
    maxExercises: 10,
    allowedExerciseTypes: ["reorder"],
    allowedModes: ["translate"],
    sourceLanguage: "en",
    targetLanguage: "de",
};

export type CreateLessonRequest = {
    promptText: string;
    difficultyLevel: DifficultyLevel;
    minExercises?: number;
    maxExercises?: number;
    allowedExerciseTypes?: string[];
    allowedModes?: string[];
    sourceLanguage?: string;
    targetLanguage?: string;
};

export type CreateLessonResponse = { lessonId: string; title: string; aiFallbackUsed?: boolean };
export type GetLessonResponse = { lesson: LessonDTO; exercises: ExerciseDTO[] };

export type LessonDTO = { id: string; title: string; contentSourceId: string };
export type ExerciseDTO = Exercise;

export type LessonActionError = { message: string; code: string };