import { Lesson } from "../../types/domain";

export interface ContentGeneratorService {
    generateExercises(promptText: string, params: GenerationParams): Promise<Lesson>;
}

export interface GenerationParams {
    difficultyLevel: string;
    minExercises: number;
    maxExercises: number;
    allowedExerciseTypes: string[];
    allowedModes: string[];
}
