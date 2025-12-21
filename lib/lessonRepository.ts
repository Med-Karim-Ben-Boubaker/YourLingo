import { prisma } from './prisma'
import { ExerciseInput } from '../types/domain'

export async function createLessonWithExercises(
    promptText: string,
    title: string,
    exercises: ExerciseInput[]
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
                    bankTokens: JSON.stringify(ex.bankTokens),
                    solutionTokens: JSON.stringify(ex.solutionTokens),
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

        const parsedExercises = lesson.exercises.map((ex) => ({
            ...ex,
            bankTokens: JSON.parse(ex.bankTokens) as string[],
            solutionTokens: JSON.parse(ex.solutionTokens) as string[],
        }))

        return {
            ...lesson,
            exercises: parsedExercises,
        }
    } catch (error) {
        console.error('Error finding lesson:', error)
        throw error
    }
}


