import { Lesson, Exercise } from "../types/domain";

interface ContentGeneratorService {
    generateExercises(promptText: string): Promise<Lesson>;
}

const MOCK_EXERCISES: Exercise[] = [
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

export class ContentGenerator implements ContentGeneratorService {
    generateExercises(_promptText: string): Promise<Lesson> {
        const generatedLesson: Lesson = {
            title: "Lesson Title",
            exercises: MOCK_EXERCISES
        };
        return Promise.resolve(generatedLesson);
    }
}
