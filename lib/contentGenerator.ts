import { Lesson, Exercise } from "../types/domain";

interface ContentGeneratorService {
    generateExercises(promptText: string): Promise<Lesson>;
}

export class ContentGenerator implements ContentGeneratorService {
    generateExercises(promptText: string): Promise<Lesson> {

        const exercises: Exercise[] = [
            {
                index: 0,
                type: "reorder",
                mode: "translate",
                questionText: "A coffee, please.",
                solutionTokens: "Ein, Kaffee, bitte",
                distractorTokens: ""
            },
            {
                index: 1,
                type: "reorder",
                mode: "translate",
                questionText: "I would like a tea.",
                solutionTokens: "Ich, hätte, gerne, einen, Tee",
                distractorTokens: ""
            }
        ];

        const generatedLesson: Lesson = {
            title: "Lesson Title",
            exercises: exercises
        }

        return Promise.resolve(generatedLesson);
    }
}