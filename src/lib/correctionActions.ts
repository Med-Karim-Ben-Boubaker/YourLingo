import { createContentGenerator } from "./contentGenerators/contentGeneratorFactory";
import { generatorConfig } from "./config/generatorConfig";
import { DEFAULT_GENERATION_PARAMS } from "../types/domain";
import { GenerationParams } from "./contentGenerators/types";

export async function createCorrectionExplanation(request: {
    questionText: string;
    userAnswer: string;
    correctAnswer: string;
    sourceLanguage?: string;
    targetLanguage?: string;
}): Promise<{ correctAnswer: string; explanation: string; aiFallbackUsed?: boolean }> {
    if (!request || !request.questionText || !request.userAnswer || !request.correctAnswer) {
        throw new Error("Invalid request: questionText, userAnswer and correctAnswer are required");
    }

    const params: GenerationParams = {
        difficultyLevel: "A1",
        minExercises: DEFAULT_GENERATION_PARAMS.minExercises,
        maxExercises: DEFAULT_GENERATION_PARAMS.maxExercises,
        allowedExerciseTypes: DEFAULT_GENERATION_PARAMS.allowedExerciseTypes,
        allowedModes: DEFAULT_GENERATION_PARAMS.allowedModes,
        sourceLanguage: request.sourceLanguage ?? DEFAULT_GENERATION_PARAMS.sourceLanguage,
        targetLanguage: request.targetLanguage ?? DEFAULT_GENERATION_PARAMS.targetLanguage,
    };

    const contentGenerator = createContentGenerator();
    let aiFallbackUsed = false;
    let result: { correctAnswer: string; explanation: string };

    try {
        result = await contentGenerator.generateCorrectionExplanation(
            request.questionText,
            request.userAnswer,
            request.correctAnswer,
            params
        );
    } catch (error) {
        if (isAIFailure(error) && !generatorConfig.strictMode) {
            console.error("AI correction generation failed, falling back to stub generator:", error);
            const { StubContentGenerator } = await import("./contentGenerators/stubContentGenerator");
            const stubGenerator = new StubContentGenerator();
            result = await stubGenerator.generateCorrectionExplanation(
                request.questionText,
                request.userAnswer,
                request.correctAnswer,
                params
            );
            aiFallbackUsed = true;
        } else {
            throw error;
        }
    }

    return { ...result, aiFallbackUsed };
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


