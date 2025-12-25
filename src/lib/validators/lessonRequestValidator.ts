import { CreateLessonRequest, DIFFICULTY_LEVELS } from "../../types/domain";
import { getPromptValidationError } from "./promptValidator";

export function validateLessonRequest(request: CreateLessonRequest): string | null {
    const promptError = getPromptValidationError(request.promptText);
    if (promptError) return promptError;

    if (!DIFFICULTY_LEVELS.includes(request.difficultyLevel)) {
        return `Invalid difficulty level. Must be one of: ${DIFFICULTY_LEVELS.join(", ")}`;
    }

    const minEx = request.minExercises ?? 1;
    if (minEx < 1) return "minExercises must be at least 1";

    const maxEx = request.maxExercises ?? 10;
    if (maxEx < minEx) return "maxExercises must be greater than or equal to minExercises";
    if (maxEx > 20) return "maxExercises cannot exceed 20";

    if (request.allowedExerciseTypes) {
        if (!Array.isArray(request.allowedExerciseTypes) || request.allowedExerciseTypes.length === 0) {
            return "allowedExerciseTypes must be a non-empty array";
        }
    }

    if (request.allowedModes) {
        if (!Array.isArray(request.allowedModes) || request.allowedModes.length === 0) {
            return "allowedModes must be a non-empty array";
        }
    }

    return null;
}
