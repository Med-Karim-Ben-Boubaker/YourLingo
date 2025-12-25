import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { DifficultyLevel } from "../../../types/domain";

interface UsePromptFormReturn {
    promptText: string;
    setPromptText: (text: string) => void;
    difficultyLevel: DifficultyLevel;
    setDifficultyLevel: (level: DifficultyLevel) => void;
    isLoading: boolean;
    error: string | null;
    handleSubmit: (e: React.FormEvent) => void;
}

export function usePromptForm(): UsePromptFormReturn {
    const [promptText, setPromptText] = useState("");
    const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>("A1");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const trimmedPrompt = promptText.trim();
        if (trimmedPrompt.length < 10) {
            setError("Please enter at least 10 characters.");
            return;
        }

        setIsLoading(true);
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        try {
            const res = await fetch("/api/lessons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    promptText: trimmedPrompt,
                    difficultyLevel,
                    minExercises: 1,
                    maxExercises: 10,
                    allowedExerciseTypes: ["reorder"],
                    allowedModes: ["translate"],
                }),
                signal: abortController.signal,
            });

            if (res.status === 201) {
                const body = await res.json();
                const lessonId = body?.lessonId;
                if (lessonId) {
                    router.push(`/lesson/${lessonId}`);
                    if (body?.aiFallbackUsed) {
                        console.warn("AI generation failed, using fallback generator");
                    }
                } else {
                    setError("Unexpected response from server.");
                }
            } else if (res.status === 400) {
                const body = await res.json();
                setError(body?.message || "Invalid request. Please adjust and try again.");
            } else if (res.status === 503) {
                setError("AI service temporarily unavailable. Please try again later.");
            } else {
                setError("Server error. Please try again later.");
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [promptText, difficultyLevel, router]);

    return { promptText, setPromptText, difficultyLevel, setDifficultyLevel, isLoading, error, handleSubmit };
}
