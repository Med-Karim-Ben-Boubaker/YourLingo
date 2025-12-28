import { useMemo } from "react";
import { parseTokens } from "../../../../lib/utils/tokenParser";
import ListenButton from "./ListenButton";

interface FeedbackMessageProps {
    exerciseId: string;
    exerciseSolution: string;
    answers: Record<string, { isCorrect: boolean }>;
    lang?: string;
}

export function FeedbackMessage({ exerciseId, exerciseSolution, answers, lang }: FeedbackMessageProps) {
    const isCorrect = answers[exerciseId]?.isCorrect;
    
    const correctAnswer = useMemo(
        () => parseTokens(String(exerciseSolution)).join(" "),
        [exerciseSolution]
    );

    return isCorrect ? (
        <p style={{ color: "green" }}>
            Correct! Correct answer: {correctAnswer}{" "}
            <ListenButton text={correctAnswer} lang={lang} />
        </p>
    ) : (
        <p style={{ color: "red" }}>
            Incorrect. Correct answer: {correctAnswer}{" "}
            <ListenButton text={correctAnswer} lang={lang} />
        </p>
    );
}
