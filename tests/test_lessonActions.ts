import { createLesson, findLesson } from "../lib/lessonActions";

async function test() {
    try {
        console.log('--- Testing Lesson Actions ---');

        console.log('Creating lesson...');
        const createResult = await createLesson("This is a test prompt");
        console.log('Lesson created:', createResult.lessonId);

        console.log('Finding lesson...');
        const findResult = await findLesson(createResult.lessonId);

        if (findResult.lessonId !== createResult.lessonId) {
            throw new Error(`ID Mismatch: ${findResult.lessonId} vs ${createResult.lessonId}`);
        }

        const gl = findResult.generatedLesson;

        const firstEx = gl.exercises[0];
        const unexpectedKeys = Object.keys(firstEx).filter(k =>
            !['index', 'type', 'mode', 'questionText', 'bankTokens', 'solutionTokens'].includes(k)
        );

        if (unexpectedKeys.length > 0) {
            throw new Error(`GeneratedLesson contains unexpected DB fields: ${unexpectedKeys.join(', ')}`);
        }

        console.log('✅ Success: findLesson returned correct Domain Object without DB artifacts.');
        console.log('Title:', gl.title);
        console.log('Exercise Count:', gl.exercises.length);

    } catch (error) {
        console.error('❌ Test Failed:', error);
        process.exit(1);
    }
}

test();