import { Lesson } from "../types/domain";
import { ContentGenerator } from "./contentGenerator";
import { createLessonWithExercises, findLessonWithExercises } from "./lessonRepository";

const MAX_PROMPT_LENGTH = 5000;

async function validatePrompt(userPrompt: string): Promise<boolean> {
    if (userPrompt.length > MAX_PROMPT_LENGTH) {
        return false;
    }
    return true;
}

export async function createLesson(userPrompt: string): Promise<{ lessonId: string, generatedLesson: Lesson }> {

    const title = "Lesson Title";

    if (!validatePrompt(userPrompt)) {
        throw new Error("Prompt is too long");
    }

    const contentGenerator = new ContentGenerator();
    const generatedLesson: Lesson = await contentGenerator.generateExercises(userPrompt);

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

export async function findLesson(lessonId: string): Promise<{ lessonId: string, generatedLesson: Lesson }> {

    const retrievedLesson = await findLessonWithExercises(lessonId);

    if (!retrievedLesson) {
        throw new Error("Lesson not found");
    }

    const generatedLesson: Lesson = {
        title: retrievedLesson.title,
        exercises: retrievedLesson.exercises.map(ex => ({
            index: ex.index,
            type: ex.type,
            mode: ex.mode,
            questionText: ex.questionText,
            solutionTokens: ex.solutionTokens,
            distractorTokens: ex.distractorTokens
        }))
    };

    return {
        lessonId: retrievedLesson.id,
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