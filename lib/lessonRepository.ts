import { prisma } from './prisma'
import { Exercise } from '../types/domain'

export async function createLessonWithExercises(
    promptText: string,
    title: string,
    exercises: Exercise[]
): Promise<string> {
    try {
        const result = await prisma.$transaction(async (tx) => {

            const source = await tx.contentSource.create({
                data: { promptText }
            })

            const lesson = await tx.lesson.create({
                data: { title, contentSourceId: source.id }
            })

            await tx.exercise.createMany({
                data: exercises.map((ex) => ({
                    lessonId: lesson.id,
                    index: ex.index,
                    type: ex.type,
                    mode: ex.mode,
                    questionText: ex.questionText,
                    solutionTokens: ex.solutionTokens,
                    distractorTokens: ex.distractorTokens,
                }))
            })

            return lesson.id
        })

        return result
    } catch (error) {
        console.error('Error creating lesson:', error)
        throw error
    }
}

export async function findLessonWithExercises(lessonId: string) {
    try {

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                exercises: {
                    orderBy: { index: 'asc' }
                }
            }
        })

        if (!lesson) return null

        // exercises already store token strings per schema; return as-is
        return {
            ...lesson,
            exercises: lesson.exercises,
        }
    } catch (error) {
        console.error('Error finding lesson:', error)
        throw error
    }
}


