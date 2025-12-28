import { Lesson } from "../../types/domain";

export interface ContentGeneratorService {
    generateExercises(promptText: string, params: GenerationParams): Promise<Lesson>;
    generateCorrectionExplanation(
        questionText: string,
        userAnswer: string,
        correctAnswer: string,
        params: GenerationParams
    ): Promise<{ correctAnswer: string; explanation: string }>;
}

export interface GenerationParams {
    difficultyLevel: string;
    minExercises: number;
    maxExercises: number;
    allowedExerciseTypes: string[];
    allowedModes: string[];
    sourceLanguage: string;
    targetLanguage: string;
}
