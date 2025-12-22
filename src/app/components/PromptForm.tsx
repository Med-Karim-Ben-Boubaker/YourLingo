"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function PromptForm() {
    const [promptText, setPromptText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {

        e.preventDefault();
        setError(null);
        if (promptText.trim().length < 10) {
            setError("Please enter at least 10 characters.");
            return;
        }
        setIsLoading(true);
            try {
                
            const res = await fetch("/api/lessons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userPrompt: promptText }),
            });

            if (res.status === 201) {
                const body = await res.json();
                const lessonId = body?.lessonId;
                if (lessonId) {
                    router.push(`/lesson/${lessonId}`);
                    return;
                } else {
                    setError("Unexpected response from server.");
                }
            } else if (res.status === 400) {
                setError("Invalid prompt. Please adjust and try again.");
            } else {
                setError("Server error. Please try again later.");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="prompt">Prompt</label>
                <br />
                <textarea
                    id="prompt"
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    rows={6}
                    cols={60}
                    placeholder="E.g. I want to learn a cafe conversation including: kaffee, tschuss, bitte, ich mochte"
                />
            </div>
            <div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create lesson"}
                </button>
            </div>
            {error && (
                <div role="alert" aria-live="assertive">
                    {error}
                </div>
            )}
        </form>
    );
}


