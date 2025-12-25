import { generatorConfig } from "../config/generatorConfig";
import { LLMContentGenerator } from "./llmContentGenerator";
import { StubContentGenerator } from "./stubContentGenerator";

export function createContentGenerator() {
    if (generatorConfig.enabled) {
        return new LLMContentGenerator();
    }
    return new StubContentGenerator();
}
