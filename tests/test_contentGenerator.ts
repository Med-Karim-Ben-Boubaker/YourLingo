import { ContentGenerator } from "../lib/contentGenerator";

async function test() {
    console.log('--- Starting Content Generator Test ---')

    const contentGenerator = new ContentGenerator()
    const exercises = await contentGenerator.generateExercises('bla bla text')

    console.log('Exercises generated:', exercises)
}

test()