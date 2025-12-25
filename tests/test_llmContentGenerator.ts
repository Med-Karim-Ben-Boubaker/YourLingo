import { LLMContentGenerator } from "../src/lib/contentGenerators/llmContentGenerator";
import { generatorConfig } from "../src/lib/config/generatorConfig";
import dotenv from 'dotenv';
dotenv.config({ path: new URL('../.env', import.meta.url) });

async function test() {
    console.log("Running LLM content generator tests...\n");

    let passed = 0;
    let failed = 0;

    console.log("--- Test 1: System prompt contains required parameters ---");
    try {
        const generator = new LLMContentGenerator();

        const testParams = {
            difficultyLevel: "B2",
            minExercises: 3,
            maxExercises: 8,
            allowedExerciseTypes: ["reorder"],
            allowedModes: ["translate"],
        };

        const systemPrompt = (generator as unknown as { buildSystemPrompt: (params: unknown) => string }).buildSystemPrompt(testParams);

        const requiredPhrases = [
            "B2",
            "3",
            "8",
            "reorder",
            "translate",
            "JSON ONLY",
        ];

        const missingPhrases = requiredPhrases.filter(
            (phrase) => !systemPrompt.includes(phrase)
        );

        if (missingPhrases.length === 0) {
            console.log("✓ System prompt contains all required parameters");
            passed++;
        } else {
            console.log(`✗ System prompt missing phrases: ${missingPhrases.join(", ")}`);
            failed++;
        }
    } catch (error: unknown) {
        console.log(`✗ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
        failed++;
    }

    console.log("\n--- Test 2: System prompt contains constraints ---");
    try {
        const generator = new LLMContentGenerator();

        const systemPrompt = (generator as unknown as { buildSystemPrompt: (params: unknown) => string }).buildSystemPrompt({
            difficultyLevel: "A1",
            minExercises: 1,
            maxExercises: 10,
            allowedExerciseTypes: ["reorder"],
            allowedModes: ["translate"],
        });

        const constraints = [
            generatorConfig.titleMaxLength,
            generatorConfig.minSolutionTokens,
            generatorConfig.maxSolutionTokens,
            generatorConfig.maxDistractorTokens,
        ];

        const missingConstraints = constraints.filter(
            (constraint) => !systemPrompt.includes(String(constraint))
        );

        if (missingConstraints.length === 0) {
            console.log("✓ System prompt contains all constraints");
            passed++;
        } else {
            console.log(`✗ System prompt missing constraints: ${missingConstraints.join(", ")}`);
            failed++;
        }
    } catch (error: unknown) {
        console.log(`✗ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
        failed++;
    }

    console.log("\n--- Test 3: Parse valid JSON response ---");
    try {
        const generator = new LLMContentGenerator();
        const validJSON = JSON.stringify({
            title: "Test Lesson",
            exercises: [
                {
                    index: 0,
                    type: "reorder",
                    mode: "translate",
                    questionText: "Test",
                    solutionTokens: "t1, t2",
                    distractorTokens: "",
                },
            ],
        });

        const result = (generator as unknown as { parseAIResponse: (text: string) => unknown }).parseAIResponse(validJSON) as { title: string; exercises: unknown[] };

        if (result.title === "Test Lesson" && result.exercises.length === 1) {
            console.log("✓ Successfully parsed valid JSON");
            passed++;
        } else {
            console.log("✗ Parsed result incorrect");
            failed++;
        }
    } catch (error: unknown) {
        console.log(`✗ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
        failed++;
    }

    console.log("\n--- Test 4: Parse invalid JSON response ---");
    try {
        const generator = new LLMContentGenerator();
        const invalidJSON = "not valid json";

        try {
            (generator as unknown as { parseAIResponse: (text: string) => unknown }).parseAIResponse(invalidJSON);
            console.log("✗ Should have thrown parse error");
            failed++;
        } catch (parseError: unknown) {
            if (parseError instanceof Error && parseError.message.includes("Failed to parse AI response as JSON")) {
                console.log("✓ Correctly handled invalid JSON");
                passed++;
            } else {
                console.log(`✗ Unexpected error: ${parseError instanceof Error ? parseError.message : "Unknown error"}`);
                failed++;
            }
        }
    } catch (error: unknown) {
        console.log(`✗ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
        failed++;
    }

    console.log("\n--- Test 5: AI failure detection ---");
    try {
        const generator = new LLMContentGenerator();

        const testErrors = [
            new Error("AI_PROVIDER_ERROR: timeout"),
            new Error("AI_TIMEOUT_ERROR: connection failed"),
            new Error("Failed to parse AI response"),
            new Error("Regular error"),
        ];

        const expectedResults = [true, true, true, false];
        const actualResults = testErrors.map((error) => (generator as unknown as { isAIFailure: (error: unknown) => boolean }).isAIFailure(error));

        if (JSON.stringify(actualResults) === JSON.stringify(expectedResults)) {
            console.log("✓ Correctly identifies AI failures");
            passed++;
        } else {
            console.log(`✗ AI failure detection incorrect`);
            console.log(`  Expected: ${expectedResults}`);
            console.log(`  Got: ${actualResults}`);
            failed++;
        }
    } catch (error: unknown) {
        console.log(`✗ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
        failed++;
    }

    console.log("\n--- Test 6: Real API call to Gemini (Integration Test) ---");
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        console.log("⊘ Skipped - GOOGLE_GENERATIVE_AI_API_KEY not set");
        console.log("  Set the environment variable to run this integration test");
        console.log("  Example: GOOGLE_GENERATIVE_AI_API_KEY=your_key npx tsx tests/test_llmContentGenerator.ts");
    } else {
        try {
            const generator = new LLMContentGenerator();

            const params = {
                difficultyLevel: "A1",
                minExercises: 1,
                maxExercises: 3,
                allowedExerciseTypes: ["reorder"],
                allowedModes: ["translate"],
            };

            console.log("  Calling Gemini API (this may take a few seconds)...");
            const startTime = Date.now();
            const result = await generator.generateExercises("Simple German cafe phrases", params);
            const duration = Date.now() - startTime;

            console.log(`  Response received in ${duration}ms`);

            const exerciseIndicesAreSequential = (): boolean => {
                const indices = result.exercises.map((ex: any) => ex.index);
                const expected = indices.map((_val: any, i: number) => i);
                return JSON.stringify(indices) === JSON.stringify(expected);
            };

            const validations = [
                { name: "title is a non-empty string", check: result.title && result.title.length > 0 },
                { name: "exercises is a non-empty array", check: result.exercises && result.exercises.length > 0 },
                { name: "exercise count within range", check: result.exercises.length >= 1 && result.exercises.length <= 3 },
                { name: "all exercises have required fields", check: result.exercises.every((ex: any) =>
                    ex.type && ex.mode && ex.questionText && ex.solutionTokens !== undefined
                )},
                { name: "exercise indices are sequential", check: exerciseIndicesAreSequential() },
                { name: "all exercises use correct type", check: result.exercises.every((ex: any) => ex.type === "reorder") },
                { name: "all exercises use correct mode", check: result.exercises.every((ex: any) => ex.mode === "translate") },
            ];

            const failedValidations = validations.filter((v) => !v.check);

            if (failedValidations.length === 0) {
                console.log(`✓ Real API call successful and validated`);
                console.log(`  Generated: "${result.title}" with ${result.exercises.length} exercise(s)`);
                passed++;
            } else {
                console.log(`✗ Real API call response validation failed`);
                failedValidations.forEach((v) => console.log(`  ✗ ${v.name}`));
                failed++;
            }
        } catch (error: unknown) {
            console.log(`✗ Real API call failed: ${error instanceof Error ? error.message : "Unknown error"}`);
            console.log(`  Check your API key and network connection`);
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
