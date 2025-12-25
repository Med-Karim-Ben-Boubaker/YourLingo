import { StubContentGenerator } from "../src/lib/contentGenerators/stubContentGenerator";

async function test() {
    const contentGenerator = new StubContentGenerator();
    const result = await contentGenerator.generateExercises("test prompt", {
        difficultyLevel: "A1",
        minExercises: 1,
        maxExercises: 10,
        allowedExerciseTypes: ["reorder"],
        allowedModes: ["translate"],
    });

    if (!result || !result.exercises || result.exercises.length === 0) {
        throw new Error("StubContentGenerator failed to generate exercises");
    }
}

test();
