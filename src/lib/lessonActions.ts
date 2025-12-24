import { Lesson } from "../types/domain";
import { ContentGenerator } from "./contentGenerator";
import { createLessonWithExercises, findLessonWithExercises } from "./lessonRepository";
import { getPromptValidationError } from "./validators/promptValidator";

export async function createLesson(userPrompt: string): Promise<{ lessonId: string; generatedLesson: Lesson }> {
    const validationError = getPromptValidationError(userPrompt);
    if (validationError) {
        throw new Error(validationError);
    }

    const contentGenerator = new ContentGenerator();
    const generatedLesson: Lesson = await contentGenerator.generateExercises(userPrompt);

    const lessonId = await createLessonWithExercises(
        userPrompt,
        generatedLesson.title,
        generatedLesson.exercises
    );

    return {
        lessonId,
        generatedLesson
    };
}

export async function getFullLesson(lessonId: string) {
    const retrievedLesson = await findLessonWithExercises(lessonId);
    if (!retrievedLesson) {
        throw new Error("Lesson not found");
    }
    return {
        lesson: {
            id: retrievedLesson.id,
            title: retrievedLesson.title,
            contentSourceId: retrievedLesson.contentSourceId,
        },
        exercises: retrievedLesson.exercises.map((ex) => ({
            id: ex.id,
            index: ex.index,
            type: ex.type,
            mode: ex.mode,
            questionText: ex.questionText,
            solutionTokens: ex.solutionTokens,
            distractorTokens: ex.distractorTokens,
        })),
    };
}
