"use client";

import { PromptInput } from "./PromptInput";
import { ErrorMessage } from "./ErrorMessage";
import { usePromptForm } from "../hooks/usePromptForm";

export default function PromptForm() {
    const { promptText, setPromptText, isLoading, error, handleSubmit } = usePromptForm();

    return (
        <form onSubmit={handleSubmit}>
            <PromptInput
                value={promptText}
                onChange={setPromptText}
                disabled={isLoading}
            />
            <div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create lesson"}
                </button>
            </div>
            <ErrorMessage message={error} />
        </form>
    );
}
