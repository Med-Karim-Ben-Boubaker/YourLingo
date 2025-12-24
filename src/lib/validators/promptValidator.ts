export const MAX_PROMPT_LENGTH = 5000;
export const MIN_PROMPT_LENGTH = 10;

export function validatePrompt(userPrompt: string): boolean {
    const trimmed = userPrompt.trim();
    return trimmed.length >= MIN_PROMPT_LENGTH && trimmed.length <= MAX_PROMPT_LENGTH;
}

export function getPromptValidationError(userPrompt: string): string | null {
    const trimmed = userPrompt.trim();
    if (trimmed.length < MIN_PROMPT_LENGTH) {
        return `Prompt must be at least ${MIN_PROMPT_LENGTH} characters.`;
    }
    if (trimmed.length > MAX_PROMPT_LENGTH) {
        return `Prompt cannot exceed ${MAX_PROMPT_LENGTH} characters.`;
    }
    return null;
}
