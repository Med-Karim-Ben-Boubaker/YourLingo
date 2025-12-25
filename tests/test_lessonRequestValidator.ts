import { validateLessonRequest } from "../src/lib/validators/lessonRequestValidator";
import { CreateLessonRequest, DifficultyLevel } from "../src/types/domain";

async function test() {
    console.log("Running lesson request validator tests...");

    let passed = 0;
    let failed = 0;

    const tests = [
        {
            name: "Valid request with all fields",
            request: {
                promptText: "This is a test prompt for learning German",
                difficultyLevel: "A1" as DifficultyLevel,
                minExercises: 1,
                maxExercises: 10,
                allowedExerciseTypes: ["reorder"],
                allowedModes: ["translate"],
            },
            expected: null,
        },
        {
            name: "Valid request with minimal fields",
            request: {
                promptText: "This is a test prompt for learning German",
                difficultyLevel: "A1" as DifficultyLevel,
            },
            expected: null,
        },
        {
            name: "Invalid prompt (too short)",
            request: {
                promptText: "short",
                difficultyLevel: "A1" as DifficultyLevel,
            },
            expected: "must be at least 10 characters",
        },
        {
            name: "Invalid difficulty level",
            request: {
                promptText: "This is a test prompt for learning German",
                difficultyLevel: "invalid" as DifficultyLevel,
            },
            expected: "Invalid difficulty level",
        },
        {
            name: "Invalid minExercises (less than 1)",
            request: {
                promptText: "This is a test prompt for learning German",
                difficultyLevel: "A1" as DifficultyLevel,
                minExercises: 0,
            },
            expected: "minExercises must be at least 1",
        },
        {
            name: "Invalid maxExercises (less than min)",
            request: {
                promptText: "This is a test prompt for learning German",
                difficultyLevel: "A1" as DifficultyLevel,
                minExercises: 10,
                maxExercises: 5,
            },
            expected: "maxExercises must be greater than or equal to minExercises",
        },
        {
            name: "Invalid maxExercises (exceeds 20)",
            request: {
                promptText: "This is a test prompt for learning German",
                difficultyLevel: "A1" as DifficultyLevel,
                maxExercises: 25,
            },
            expected: "maxExercises cannot exceed 20",
        },
        {
            name: "Invalid allowedExerciseTypes (empty array)",
            request: {
                promptText: "This is a test prompt for learning German",
                difficultyLevel: "A1" as DifficultyLevel,
                allowedExerciseTypes: [],
            },
            expected: "allowedExerciseTypes must be a non-empty array",
        },
        {
            name: "Invalid allowedModes (empty array)",
            request: {
                promptText: "This is a test prompt for learning German",
                difficultyLevel: "A1" as DifficultyLevel,
                allowedModes: [],
            },
            expected: "allowedModes must be a non-empty array",
        },
    ];

    for (const test of tests) {
        const result = validateLessonRequest(test.request as CreateLessonRequest);

        if (test.expected === null) {
            if (result === null) {
                console.log(`✓ ${test.name}`);
                passed++;
            } else {
                console.log(`✗ ${test.name}`);
                console.log(`  Expected: no error`);
                console.log(`  Got: ${result}`);
                failed++;
            }
        } else {
            if (result && result.includes(test.expected)) {
                console.log(`✓ ${test.name}`);
                passed++;
            } else {
                console.log(`✗ ${test.name}`);
                console.log(`  Expected error to include: ${test.expected}`);
                console.log(`  Got: ${result}`);
                failed++;
            }
        }
    }

    console.log(`\nTests passed: ${passed}/${tests.length}`);
    console.log(`Tests failed: ${failed}/${tests.length}`);

    if (failed > 0) {
        process.exit(1);
    }
}

test();
