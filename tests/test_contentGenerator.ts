import { ContentGenerator } from "../src/lib/contentGenerator";

async function test() {
    const contentGenerator = new ContentGenerator()
    const result = await contentGenerator.generateExercises('test prompt')

    if (!result || !result.exercises || result.exercises.length === 0) {
        throw new Error('ContentGenerator failed to generate exercises');
    }
}

test()
