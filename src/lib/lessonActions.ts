import { Lesson, CreateLessonRequest, DEFAULT_GENERATION_PARAMS } from "../types/domain";
import { createContentGenerator } from "./contentGenerators/contentGeneratorFactory";
import { createLessonWithExercises, findLessonWithExercises } from "./lessonRepository";
import { validateLessonRequest } from "./validators/lessonRequestValidator";
import { validateLesson, sanitizeLesson } from "./validators/lessonValidator";
import { generatorConfig } from "./config/generatorConfig";

export async function createLesson(request: CreateLessonRequest): Promise<{
    lessonId: string;
    generatedLesson: Lesson;
    aiFallbackUsed: boolean;
}> {
    const validationError = validateLessonRequest(request);
    if (validationError) {
        throw new Error(validationError);
    }

    const params = {
        difficultyLevel: request.difficultyLevel,
        minExercises: request.minExercises ?? DEFAULT_GENERATION_PARAMS.minExercises,
        maxExercises: request.maxExercises ?? DEFAULT_GENERATION_PARAMS.maxExercises,
        allowedExerciseTypes: request.allowedExerciseTypes ?? DEFAULT_GENERATION_PARAMS.allowedExerciseTypes,
        allowedModes: request.allowedModes ?? DEFAULT_GENERATION_PARAMS.allowedModes,
        sourceLanguage: request.sourceLanguage ?? DEFAULT_GENERATION_PARAMS.sourceLanguage,
        targetLanguage: request.targetLanguage ?? DEFAULT_GENERATION_PARAMS.targetLanguage,
    };

    const contentGenerator = createContentGenerator();
    let aiFallbackUsed = false;
    let generatedLesson: Lesson;

    try {
        generatedLesson = await contentGenerator.generateExercises(request.promptText, params);
    } catch (error) {
        if (isAIFailure(error) && !generatorConfig.strictMode) {
            console.error("AI generation failed, falling back to stub generator:", error);
            const { StubContentGenerator } = await import("./contentGenerators/stubContentGenerator");
            const stubGenerator = new StubContentGenerator();
            generatedLesson = await stubGenerator.generateExercises(request.promptText, params);
            aiFallbackUsed = true;
        } else {
            throw error;
        }
    }

    const sanitizedLesson = sanitizeLesson(
        generatedLesson,
        params.allowedExerciseTypes,
        params.allowedModes
    );

    const validationError2 = validateLesson(sanitizedLesson);
    if (!validationError2.isValid) {
        throw new Error(`Generated lesson validation failed: ${validationError2.error}`);
    }

    const lessonId = await createLessonWithExercises(
        request.promptText,
        sanitizedLesson.title,
        sanitizedLesson.exercises
    );

    return { lessonId, generatedLesson: sanitizedLesson, aiFallbackUsed };
}

function isAIFailure(error: unknown): boolean {
    if (error instanceof Error) {
        return error.message.includes("AI_PROVIDER_ERROR") ||
               error.message.includes("AI_TIMEOUT_ERROR") ||
               error.message.includes("AI generation failed") ||
               error.message.includes("Failed to parse AI response");
    }
    return false;
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
            sourceLanguage: ex.sourceLanguage,
            targetLanguage: ex.targetLanguage,
        })),
    };
}
