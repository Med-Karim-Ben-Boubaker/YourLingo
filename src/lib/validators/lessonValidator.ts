import { Lesson, Exercise } from "../../types/domain";
import { z } from "zod";
import { sanitizeTokens } from "../utils/tokenUtils";

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

// Zod schemas for runtime validation (keeps type information via z.infer if needed)
const ExerciseSchema = z.object({
    id: z.string().optional(),
    index: z.number().int().nonnegative().optional(),
    type: z.string().optional(),
    mode: z.string().optional(),
    questionText: z.string().min(1, "questionText cannot be empty"),
    solutionTokens: z.string().min(1, "solutionTokens must contain at least one token"),
    distractorTokens: z.string().optional().default(""),
});

const LessonSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Title cannot be empty").transform((s) => s.trim().slice(0, 120)),
    exercises: z.array(ExerciseSchema).min(1, "Exercises array cannot be empty"),
});

export function validateLesson(lesson: Lesson): ValidationResult {
    // Basic structural validation using Zod
    const parsed = LessonSchema.safeParse(lesson);
    if (!parsed.success) {
        // return first error message for compatibility with existing code
        const firstIssue = parsed.error.issues[0];
        return { isValid: false, error: firstIssue ? firstIssue.message : "Invalid lesson" };
    }

    // Ensure each exercise passes the more specific exercise validation
    for (let i = 0; i < lesson.exercises.length; i++) {
        const exerciseError = validateExercise(lesson.exercises[i]);
        if (exerciseError) {
            return { isValid: false, error: `Exercise ${i}: ${exerciseError}` };
        }
    }

    return { isValid: true };
}

export function validateExercise(exercise: Exercise): string | null {
    // Use Zod for shape validation, but keep token-level checks explicit for clear messages
    const parsed = ExerciseSchema.safeParse(exercise);
    if (!parsed.success) {
        const firstIssue = parsed.error.issues[0];
        return firstIssue ? firstIssue.message : "Invalid exercise";
    }

    // Ensure solutionTokens parse to at least one token
    const solution = parsed.data.solutionTokens ? parsed.data.solutionTokens.trim() : "";
    if (solution.length === 0 || sanitizeTokens(solution, "")?.solution.trim().length === 0) {
        return "solutionTokens must contain at least one token";
    }

    return null;
}

export function sanitizeLesson(
    lesson: Lesson,
    allowedTypes: string[],
    allowedModes: string[]
): Lesson {
    const sanitizedExercises = lesson.exercises.map((ex: Exercise, idx: number) =>
        sanitizeExercise(ex, idx, allowedTypes, allowedModes)
    );

    return {
        title: lesson.title.trim().substring(0, 120),
        exercises: reindexExercises(sanitizedExercises),
    };
}

export function sanitizeExercise(
    exercise: Exercise,
    index: number,
    allowedTypes: string[],
    allowedModes: string[]
): Exercise {
    const type = allowedTypes.includes(exercise.type) ? exercise.type : "reorder";
    const mode = allowedModes.includes(exercise.mode) ? exercise.mode : "translate";

    const { solution, distractors } = sanitizeTokens(
        String(exercise.solutionTokens || ""),
        String(exercise.distractorTokens || "")
    );

    return {
        ...exercise,
        index,
        type,
        mode,
        questionText: (exercise.questionText || "").trim(),
        solutionTokens: solution,
        distractorTokens: distractors,
    };
}

export function reindexExercises(exercises: Exercise[]): Exercise[] {
    return exercises.map((exercise, index) => ({
        ...exercise,
        index,
    }));
}
