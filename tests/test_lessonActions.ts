import { createLesson, getFullLesson } from "../src/lib/lessonActions";

async function test() {
    try {
        const createResult = await createLesson("This is a test prompt");
        const getFullLessonResult = await getFullLesson(createResult.lessonId);

        if (getFullLessonResult.lesson.id !== createResult.lessonId) {
            throw new Error(`ID Mismatch: ${getFullLessonResult.lesson.id} vs ${createResult.lessonId}`);
        }

        const firstEx = getFullLessonResult.exercises[0];
        const unexpectedKeys = Object.keys(firstEx).filter(k =>
            !['id', 'index', 'type', 'mode', 'questionText', 'solutionTokens', 'distractorTokens'].includes(k)
        );

        if (unexpectedKeys.length > 0) {
            throw new Error(`getFullLesson contains unexpected DB fields: ${unexpectedKeys.join(', ')}`);
        }
    } catch (error) {
        console.error('❌ Test Failed:', error);
        process.exit(1);
    }
}

test();
