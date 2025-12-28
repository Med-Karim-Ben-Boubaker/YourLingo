import { useMemo, useEffect, useState } from "react";
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

    // fetch explanation only when the answer is incorrect
    useEffect(() => {
        let cancelled = false;
        async function fetchExplanation() {
            if (isCorrect !== false) return;
            // avoid re-fetching if we already have an explanation
            if (explanation || loading) return;
            setLoading(true);
            setError(null);
            try {
                if (!questionText || !userAnswer) {
                    // missing context to request explanation
                    setLoading(false);
                    return;
                }
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
                // If server returns non-JSON or error, fall back to not showing explanation
                if (!res.ok) {
                    const text = await res.text();
                    if (!cancelled) setError(`Explanation unavailable: ${res.status}`);
                    setLoading(false);
                    return;
                }
                const data = await res.json();
                if (!cancelled) setExplanation(String(data.explanation || ""));
            } catch (err: unknown) {
                if (!cancelled) setError("Explanation unavailable");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchExplanation();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCorrect, exerciseId]);

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
            {!loading && explanation && (
                <p style={{ color: "#333" }}>{explanation}</p>
            )}
        </div>
    );
}
