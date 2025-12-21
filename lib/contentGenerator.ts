import { GeneratedLesson, ExerciseInput } from "../types/domain";

interface ContentGeneratorService {
    generateExercises(promptText: string): Promise<GeneratedLesson>;
}

export class ContentGenerator implements ContentGeneratorService {
    generateExercises(promptText: string): Promise<GeneratedLesson> {

        const exercises: ExerciseInput[] = [
            {
                index: 0,
                type: "reorder",
                mode: "translate",
                questionText: "A coffee, please.",
                bankTokens: ["Ein", "Kaffee", "bitte"],
                solutionTokens: ["Ein", "Kaffee", "bitte"]
            },
            {
                index: 1,
                type: "reorder",
                mode: "translate",
                questionText: "I would like a tea.",
                bankTokens: ["Ich", "hätte", "gerne", "einen", "Tee"],
                solutionTokens: ["Ich", "hätte", "gerne", "einen", "Tee"]
            }
        ];

        const generatedLesson: GeneratedLesson = {
            title: "Lesson Title",
            exercises: exercises
        }

        return Promise.resolve(generatedLesson);
    }
}