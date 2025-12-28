import { useMemo, useState } from "react";
import { parseTokens } from "../../../../lib/utils/tokenParser";
import ListenButton from "./ListenButton";

interface FeedbackMessageProps {
    exerciseId: string;
    exerciseSolution: string;
    answers: Record<string, { isCorrect: boolean }>;
    lang?: string;
    questionText?: string;
    userAnswer?: string;
    sourceLanguage?: string;
}

export function FeedbackMessage({ exerciseId, exerciseSolution, answers, lang, questionText, userAnswer, sourceLanguage }: FeedbackMessageProps) {
    const isCorrect = answers[exerciseId]?.isCorrect;
    
    const correctAnswer = useMemo(
        () => parseTokens(String(exerciseSolution)).join(" "),
        [exerciseSolution]
    );
    const [explanation, setExplanation] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleExplainClick() {
        if (loading) return;
        if (!questionText || !userAnswer) {
            setError("Missing context to explain.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/lessons/explain-correction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    questionText,
                    userAnswer,
                    correctAnswer,
                    sourceLanguage,
                    targetLanguage: lang
                }),
            });
            if (!res.ok) {
                setError(`Explanation unavailable: ${res.status}`);
                setLoading(false);
                return;
            }
            const data = await res.json();
            setExplanation(String(data.explanation || ""));
        } catch (err: unknown) {
            setError("Explanation unavailable");
        } finally {
            setLoading(false);
        }
    }

    if (isCorrect) {
        return (
            <p style={{ color: "green" }}>
                Correct! Correct answer: {correctAnswer}{" "}
                <ListenButton text={correctAnswer} lang={lang} />
            </p>
        );
    }

    return (
        <div>
            <p style={{ color: "red" }}>
                Incorrect. Correct answer: {correctAnswer}{" "}
                <ListenButton text={correctAnswer} lang={lang} />
            </p>
            {loading && <p>Loading explanation...</p>}
            {error && <p style={{ color: "gray" }}>{error}</p>}
            {!loading && !explanation && (
                <button onClick={handleExplainClick}>Explain why</button>
            )}
            {!loading && explanation && (
                <>
                    <p style={{ color: "#333" }}>{explanation}</p>
                    <button onClick={() => setExplanation(null)}>Hide explanation</button>
                </>
            )}
        </div>
    );
}
