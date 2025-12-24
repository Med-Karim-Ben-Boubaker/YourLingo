import { useMemo } from "react";
import { parseTokens } from "../../../../lib/utils/tokenParser";

interface FeedbackMessageProps {
    exerciseId: string;
    exerciseSolution: string;
    answers: Record<string, { isCorrect: boolean }>;
}

export function FeedbackMessage({ exerciseId, exerciseSolution, answers }: FeedbackMessageProps) {
    const isCorrect = answers[exerciseId]?.isCorrect;
    
    const correctAnswer = useMemo(() => 
        parseTokens(String(exerciseSolution)).join(" "),
        [exerciseSolution]
    );

    return isCorrect ? (
        <p style={{ color: "green" }}>Correct!</p>
    ) : (
        <p style={{ color: "red" }}>
            Incorrect. Correct answer: {correctAnswer}
        </p>
    );
}
