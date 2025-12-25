"use client";

import { PromptInput } from "./PromptInput";
import { ErrorMessage } from "./ErrorMessage";
import { usePromptForm } from "../hooks/usePromptForm";

export default function PromptForm() {
    const { promptText, setPromptText, difficultyLevel, setDifficultyLevel, isLoading, error, handleSubmit } = usePromptForm();

    return (
        <form onSubmit={handleSubmit}>
            <PromptInput
                value={promptText}
                onChange={setPromptText}
                disabled={isLoading}
            />
            <div>
                <label htmlFor="difficulty">Difficulty Level:</label>
                <select
                    id="difficulty"
                    value={difficultyLevel}
                    onChange={(e) => setDifficultyLevel(e.target.value as "A1" | "A2" | "B1" | "B2")}
                    disabled={isLoading}
                >
                    <option value="A1">A1 - Beginner</option>
                    <option value="A2">A2 - Elementary</option>
                    <option value="B1">B1 - Intermediate</option>
                    <option value="B2">B2 - Upper-Intermediate</option>
                </select>
            </div>
            <div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create lesson"}
                </button>
            </div>
            <ErrorMessage message={error} />
        </form>
    );
}
