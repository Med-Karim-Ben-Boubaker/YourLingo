export const generatorConfig = {
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    enabled: process.env.USE_LLMT_GENERATOR !== "false",
    strictMode: process.env.LLM_STRICT_MODE === "true",
    titleMaxLength: 120,
    minSolutionTokens: 1,
    maxSolutionTokens: 15,
    maxDistractorTokens: 5,
};
