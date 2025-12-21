import { createLessonWithExercises, findLessonWithExercises } from '../lib/lessonRepository'
import { ExerciseInput } from '../types/domain'

async function test() {
    console.log('--- Starting Database Test ---')

    const dummyPrompt = "I want to learn about ordering coffee in Berlin."
    const dummyTitle = "Coffee Shop Basics"
    const dummyExercises: ExerciseInput[] = [
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

            // check first exercise
            const firstEx = retrievedLesson.exercises[0]
            console.log('First exercise bank tokens:', firstEx.bankTokens)
            if (Array.isArray(firstEx.bankTokens)) {
                console.log('✅ Success! bankTokens is an array.')
            } else {
                console.error('❌ Error: bankTokens is NOT an array.')
            }
        } else {
            console.error('❌ Error: Could not find lesson with ID:', lessonId)
        }

    } catch (err) {
        console.error('❌ Test failed:', err)
    }
}

test()