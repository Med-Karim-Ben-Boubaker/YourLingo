import { createLessonWithExercises, findLessonWithExercises } from '../src/lib/lessonRepository'
import { Exercise } from '../src/types/domain'

async function test() {
    const dummyPrompt = "I want to learn about ordering coffee in Berlin."
    const dummyTitle = "Coffee Shop Basics"
    const dummyExercises: Exercise[] = [
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
    ]

    try {
        const lessonId = await createLessonWithExercises(dummyPrompt, dummyTitle, dummyExercises)
        const retrievedLesson = await findLessonWithExercises(lessonId)

        if (!retrievedLesson) {
            throw new Error('Could not find lesson with ID: ' + lessonId);
        }

        if (retrievedLesson.exercises.length !== dummyExercises.length) {
            throw new Error('Number of exercises mismatch.');
        }

        const firstEx = retrievedLesson.exercises[0]
        if (typeof firstEx.solutionTokens !== 'string') {
            throw new Error('solutionTokens is NOT a string.');
        }
    } catch (err) {
        console.error('❌ Test failed:', err);
        process.exit(1);
    }
}

test()
