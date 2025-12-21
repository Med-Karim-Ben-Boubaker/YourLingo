// Types defining the input/output contracts
export type ExerciseInput = {
    index: number
    type: string
    mode: string
    questionText: string
    bankTokens: string[]
    solutionTokens: string[]
}

export type GeneratedLesson = {
    title: string
    exercises: ExerciseInput[]
}