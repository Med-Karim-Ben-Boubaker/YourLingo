import { createLessonWithExercises, findLessonWithExercises } from '../lib/lessonRepository'
import { Exercise } from '../types/domain'

async function test() {
    console.log('--- Starting Database Test ---')

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
        console.log('✅ Success! Created lesson with ID:', lessonId)

        const retrievedLesson = await findLessonWithExercises(lessonId)

        if (retrievedLesson) {
            console.log('✅ Success! Found lesson:', retrievedLesson.title)
            console.log('Number of exercises found:', retrievedLesson.exercises.length)

            if (retrievedLesson.exercises.length === dummyExercises.length) {
                console.log('✅ Success! Number of exercises match.')
            } else {
                console.error('❌ Error: Number of exercises mismatch.')
            }

            // check first exercise token storage (strings per spec)
            const firstEx = retrievedLesson.exercises[0]
            console.log('First exercise solutionTokens:', firstEx.solutionTokens)
            if (typeof firstEx.solutionTokens === 'string') {
                console.log('✅ Success! solutionTokens is a string.')
            } else {
                console.error('❌ Error: solutionTokens is NOT a string.')
            }
        } else {
            console.error('❌ Error: Could not find lesson with ID:', lessonId)
        }

    } catch (err) {
        console.error('❌ Test failed:', err)
    }
}

test()