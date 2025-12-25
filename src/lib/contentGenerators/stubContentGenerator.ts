import { ContentGeneratorService, GenerationParams } from "./types";
import { Lesson, Exercise } from "../../types/domain";
import { joinTokens } from "../utils/tokenParser";

export class StubContentGenerator implements ContentGeneratorService {
    generateExercises(promptText: string, params: GenerationParams): Promise<Lesson> {
        const numExercises = Math.min(
            Math.max(params.minExercises, 1),
            Math.min(params.maxExercises, 5)
        );

        const exercises: Exercise[] = Array.from({ length: numExercises }, (_, i) => ({
            index: i,
            type: params.allowedExerciseTypes[0] || "reorder",
            mode: params.allowedModes[0] || "translate",
            questionText: `Stub exercise ${i + 1} for prompt: "${promptText.substring(0, 50)}..."`,
            solutionTokens: joinTokens([`word${i}_1`, `word${i}_2`, `word${i}_3`]),
            distractorTokens: "",
        }));

        const generatedLesson: Lesson = {
            title: `Stub Lesson (${params.difficultyLevel})`,
            exercises,
        };

        return Promise.resolve(generatedLesson);
    }
}
