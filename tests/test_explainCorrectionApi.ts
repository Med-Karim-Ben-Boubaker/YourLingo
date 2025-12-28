import dotenv from "dotenv";
dotenv.config({ path: new URL("../.env", import.meta.url) });

import { createCorrectionExplanation } from "../src/lib/correctionActions";
import { generatorConfig } from "../src/lib/config/generatorConfig";

async function test() {
    console.log("Running explain-correction API/action tests...\n");

    let passed = 0;
    let failed = 0;

    console.log("--- Test 1: Basic call returns expected shape ---");
    try {
        const req = {
            questionText: "Das ist kein Buch.",
            userAnswer: "This is no book",
            correctAnswer: "This is not a book.",
            sourceLanguage: "de",
            targetLanguage: "en",
        };

        // If LLM is enabled but no API key, we expect real call to fail; handle below.
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

        if (generatorConfig.enabled && !apiKey) {
            console.log("⊘ Skipped - LLM generator enabled but GOOGLE_GENERATIVE_AI_API_KEY not set");
            console.log("  To run real integration, set GOOGLE_GENERATIVE_AI_API_KEY in your environment");
            passed++;
        } else {
            const result = await createCorrectionExplanation(req);
            if (
                result &&
                typeof result.correctAnswer === "string" &&
                typeof result.explanation === "string"
            ) {
                console.log("✓ createCorrectionExplanation returned expected shape");
                console.log(`  correctAnswer: "${result.correctAnswer}"`);
                console.log(`  explanation: "${result.explanation}"`);
                passed++;
            } else {
                console.log("✗ Returned shape incorrect");
                failed++;
            }
        }
    } catch (error: unknown) {
        if (error instanceof Error && error.message.includes("AI_PROVIDER_ERROR") && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            console.log("⊘ Skipped - AI provider error without API key");
            passed++;
        } else {
            console.log(`✗ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
            failed++;
        }
    }

    console.log(`\nTests passed: ${passed}/${passed + failed}`);
    console.log(`Tests failed: ${failed}/${passed + failed}`);

    if (failed > 0) {
        process.exit(1);
    }
}

test();


