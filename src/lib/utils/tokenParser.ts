export function parseTokens(tokenString: string): string[] {
    const s = (tokenString ?? "").trim();
    if (s.length === 0) return [];
    return s.split(", ").map((t) => t.trim()).filter(Boolean);
}

export function joinTokens(tokens: string[]): string {
    return tokens.map((t) => t.trim()).filter(Boolean).join(", ");
}
