import { FeedbackMessage } from "./FeedbackMessage";
import ListenButton from "./ListenButton";

interface AnswerAreaProps {
    answerTokens: string[];
    locked: boolean;
    exerciseId: string;
    exerciseSolution: string;
    questionText?: string;
    answers: Record<string, { isCorrect: boolean }>;
    currentIndex: number;
    totalExercises: number;
    onClear: () => void;
    onCheckAnswer: () => void;
    onNext: () => void;
    answerLang?: string;
    sourceLang?: string;
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
    , answerLang
    , questionText, sourceLang
}: AnswerAreaProps) {
    const answerText = answerTokens.join(" ");
    return (
        <div>
            <p>Answer: {answerText}</p>
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
                {answerTokens.length > 0 && (
                    <ListenButton text={answerText} lang={answerLang} />
                )}
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
                        lang={answerLang}
                        questionText={questionText}
                        userAnswer={answerText}
                        sourceLanguage={sourceLang}
                    />
                </div>
            )}
        </div>
    );
}
