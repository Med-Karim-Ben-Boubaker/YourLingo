import { FeedbackMessage } from "./FeedbackMessage";

interface AnswerAreaProps {
    answerTokens: string[];
    locked: boolean;
    exerciseId: string;
    exerciseSolution: string;
    answers: Record<string, { isCorrect: boolean }>;
    currentIndex: number;
    totalExercises: number;
    onClear: () => void;
    onCheckAnswer: () => void;
    onNext: () => void;
}

export function AnswerArea({
    answerTokens,
    locked,
    exerciseId,
    exerciseSolution,
    answers,
    currentIndex,
    totalExercises,
    onClear,
    onCheckAnswer,
    onNext
}: AnswerAreaProps) {
    return (
        <div>
            <p>Answer: {answerTokens.join(" ")}</p>
            <div>
                <button onClick={onClear} disabled={locked}>
                    Clear
                </button>
                <button
                    onClick={onCheckAnswer}
                    disabled={answerTokens.length === 0 || locked}
                >
                    Check
                </button>
                <button onClick={onNext} disabled={!locked}>
                    {currentIndex + 1 >= totalExercises ? "Finish" : "Next"}
                </button>
            </div>
            {locked && (
                <div>
                    <FeedbackMessage
                        exerciseId={exerciseId}
                        exerciseSolution={exerciseSolution}
                        answers={answers}
                    />
                </div>
            )}
        </div>
    );
}
