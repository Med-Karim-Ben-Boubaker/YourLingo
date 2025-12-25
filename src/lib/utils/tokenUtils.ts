import { parseTokens, joinTokens } from "./../utils/tokenParser";

export function removeDuplicatesCaseInsensitive(tokens: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const token of tokens) {
        const lower = token.toLowerCase();
        if (!seen.has(lower)) {
            seen.add(lower);
            result.push(token);
        }
    }
    return result;
}

export function sanitizeTokens(solutionTokensRaw: string, distractorTokensRaw: string): { solution: string; distractors: string } {
    const solution = parseTokens(solutionTokensRaw);
    const distractors = parseTokens(distractorTokensRaw);

    const uniqueSolution = removeDuplicatesCaseInsensitive(solution);
    const solutionLower = uniqueSolution.map((t) => t.toLowerCase());

    const filteredDistractors = distractors.filter(
        (d) => !solutionLower.includes(d.toLowerCase())
    );

    const uniqueDistractors = removeDuplicatesCaseInsensitive(filteredDistractors);

    return {
        solution: joinTokens(uniqueSolution),
        distractors: joinTokens(uniqueDistractors),
    };
}


