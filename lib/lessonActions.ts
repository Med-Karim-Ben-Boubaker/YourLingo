import { GeneratedLesson } from "../types/domain";
import { ContentGenerator } from "./contentGenerator";
import { createLessonWithExercises, findLessonWithExercises } from "./lessonRepository";

const MAX_PROMPT_LENGTH = 5000;

async function validatePrompt(userPrompt: string): Promise<boolean> {
    if (userPrompt.length > MAX_PROMPT_LENGTH) {
        return false;
    }
    return true;
}

export async function createLesson(userPrompt: string): Promise<{ lessonId: string, generatedLesson: GeneratedLesson }> {

    const title = "Lesson Title";

    if (!validatePrompt(userPrompt)) {
        throw new Error("Prompt is too long");
    }

    const contentGenerator = new ContentGenerator();
    const generatedLesson: GeneratedLesson = await contentGenerator.generateExercises(userPrompt);

    const lessonId = await createLessonWithExercises(
        userPrompt,
        title,
        generatedLesson.exercises
    );

    return {
        lessonId,
        generatedLesson
    };
}

export async function findLesson(lessonId: string): Promise<{ lessonId: string, generatedLesson: GeneratedLesson }> {

    const retrievedLesson = await findLessonWithExercises(lessonId);

    if (!retrievedLesson) {
        throw new Error("Lesson not found");
    }

    const generatedLesson: GeneratedLesson = {
        title: retrievedLesson.title,
        exercises: retrievedLesson.exercises.map(ex => ({
            index: ex.index,
            type: ex.type,
            mode: ex.mode,
            questionText: ex.questionText,
            bankTokens: ex.bankTokens,
            solutionTokens: ex.solutionTokens
        }))
    };

    return {
        lessonId: retrievedLesson.id,
        generatedLesson
    };
}