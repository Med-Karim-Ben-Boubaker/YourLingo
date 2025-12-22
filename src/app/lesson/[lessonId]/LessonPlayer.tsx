"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Exercise } from "../../../../types/domain";
import { Lesson } from "../../../../types/domain";

export default function LessonPlayer({ lessonId }: { lessonId: string }) {
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentAnswerTokens, setCurrentAnswerTokens] = useState<string[]>(
        []
    );
    const [usedTokenIndexes, setUsedTokenIndexes] = useState<Set<number>>(
        () => new Set()
    );
    const [bankTokensOrder, setBankTokensOrder] = useState<string[]>([]);
    const [locked, setLocked] = useState(false);
    const [answers, setAnswers] = useState<Record<string, { isCorrect: boolean }>>(
        {}
    );
    const [showSummary, setShowSummary] = useState(false);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/lessons/" + lessonId);
                if (res.status === 404) {
                    setNotFound(true);
                    return;
                }
                const payload: Lesson = await res.json();
                if (cancelled) return;
                // store exercises as received (token fields are comma-separated strings)
                setLesson(payload);
                setExercises(payload.exercises.sort((a, b) => a.index - b.index));
            } catch (err) {
                setError("Failed to load lesson.");
            } finally {
                setIsLoading(false);
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, [lessonId]);

    useEffect(() => {
        // reset per-exercise state when index changes and compute bank order once
        setCurrentAnswerTokens([]);
        setUsedTokenIndexes(new Set());
        setLocked(false);
        const ex = exercises[currentIndex];
        if (ex) {
            const solutionArray = parseTokens(String(ex.solutionTokens));
            const distractorArray = parseTokens(String(ex.distractorTokens));
            setBankTokensOrder(shuffleArray([...solutionArray, ...distractorArray]));
        } else {
            setBankTokensOrder([]);
        }
    }, [currentIndex, exercises]);

    function parseTokens(tokenString: string) {
        const s = (tokenString ?? "").trim();
        if (s.length === 0) return [];
        return s.split(", ").map((t) => t.trim()).filter(Boolean);
    }

    function shuffleArray<T>(arr: T[]) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = a[i];
            a[i] = a[j];
            a[j] = tmp;
        }
        return a;
    }

    function selectToken(token: string, idx: number) {
        if (locked) return;
        if (usedTokenIndexes.has(idx)) return;
        setCurrentAnswerTokens((s) => [...s, token]);
        setUsedTokenIndexes((prev) => {
            const next = new Set(prev);
            next.add(idx);
            return next;
        });
    }

    function clearCurrent() {
        if (locked) return;
        setCurrentAnswerTokens([]);
        setUsedTokenIndexes(new Set());
    }

    function checkAnswer() {
        const ex = exercises[currentIndex];
        if (!ex) return;
        const solution = parseTokens(String(ex.solutionTokens));
        const user = currentAnswerTokens;
        const isCorrect =
            user.length === solution.length &&
            user.every(
                (t, i) => t.toLowerCase() === (solution[i] || "").toLowerCase()
            );
        setAnswers((prev) => ({ ...prev, [ex.id]: { isCorrect } }));
        setLocked(true);
    }

    function goNext() {
        if (currentIndex + 1 >= exercises.length) {
            setShowSummary(true);
            return;
        }
        setCurrentIndex((i) => i + 1);
    }

    const correctCount = useMemo(() => {
        return Object.values(answers).filter((a) => a.isCorrect).length;
    }, [answers]);

    if (isLoading) {
        return <div>Loading lesson...</div>;
    }
    if (notFound) {
        return (
            <div>
                <p>Lesson not found.</p>
                <Link href="/">Back to home</Link>
            </div>
        );
    }
    if (error) {
        return (
            <div>
                <p>{error}</p>
                <Link href="/">Back to home</Link>
            </div>
        );
    }
    if (!lesson) {
        return <div>No lesson data.</div>;
    }

    if (showSummary) {
        return (
            <div>
                <h2>Summary</h2>
                <p>
                    You got {correctCount} / {exercises.length} correct.
                </p>
                <Link href="/">Back to home</Link>
            </div>
        );
    }

    const exercise = exercises[currentIndex];
    const bankTokens: string[] = bankTokensOrder;

    return (
        <main>
            <header>
                <h1>{lesson.title}</h1>
            </header>
            <section>
                <div>
                    <strong>
                        {currentIndex + 1} of {exercises.length}
                    </strong>
                </div>
                <div>
                    <p>{exercise.questionText}</p>
                </div>
                <div>
                    <div>
                        {bankTokens.map((token, idx) => {
                            const disabled = usedTokenIndexes.has(idx) || locked;
                            return (
                                <button
                                    key={String(idx)}
                                    onClick={() => selectToken(token, idx)}
                                    disabled={disabled}
                                    aria-pressed={disabled}
                                >
                                    {token}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div>
                    <p>Answer: {currentAnswerTokens.join(" ")}</p>
                    <div>
                        <button onClick={clearCurrent} disabled={locked}>
                            Clear
                        </button>
                        <button
                            onClick={checkAnswer}
                            disabled={currentAnswerTokens.length === 0 || locked}
                        >
                            Check
                        </button>
                        <button onClick={goNext} disabled={!locked}>
                            {currentIndex + 1 >= exercises.length ? "Finish" : "Next"}
                        </button>
                    </div>
                    {locked && (
                        <div>
                            {answers[exercise.id]?.isCorrect ? (
                                <p style={{ color: "green" }}>Correct!</p>
                            ) : (
                                <p style={{ color: "red" }}>
                                    Incorrect. Correct answer:{" "}
                                    {parseTokens(String(exercise.solutionTokens)).join(" ")}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}


