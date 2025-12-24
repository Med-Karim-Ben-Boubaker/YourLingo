import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface UsePromptFormReturn {
    promptText: string;
    setPromptText: (text: string) => void;
    isLoading: boolean;
    error: string | null;
    handleSubmit: (e: React.FormEvent) => void;
}

export function usePromptForm(): UsePromptFormReturn {
    const [promptText, setPromptText] = useState("");
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
                body: JSON.stringify({ userPrompt: trimmedPrompt }),
                signal: abortController.signal
            });

            if (res.status === 201) {
                const body = await res.json();
                const lessonId = body?.lessonId;
                if (lessonId) {
                    router.push(`/lesson/${lessonId}`);
                } else {
                    setError("Unexpected response from server.");
                }
            } else if (res.status === 400) {
                setError("Invalid prompt. Please adjust and try again.");
            } else {
                setError("Server error. Please try again later.");
            }
        } catch (_err) {
            setError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [promptText, router]);

    return { promptText, setPromptText, isLoading, error, handleSubmit };
}
