import {
    validateLesson,
    validateExercise,
    sanitizeLesson,
    sanitizeExercise,
    reindexExercises,
} from "../src/lib/validators/lessonValidator";
import { Lesson, Exercise } from "../src/types/domain";

async function test() {
    console.log("Running lesson validator tests...");

    let passed = 0;
    let failed = 0;

    console.log("\n--- validateLesson tests ---");

    const validateTests = [
        {
            name: "Valid lesson",
            lesson: {
                title: "Test Lesson",
                exercises: [
                    {
                        index: 0,
                        type: "reorder",
                        mode: "translate",
                        questionText: "Test question",
                        solutionTokens: "token1, token2",
                        distractorTokens: "distractor1, distractor2",
                    },
                ],
            } as Lesson,
            expected: true,
        },
        {
            name: "Invalid lesson (empty title)",
            lesson: {
                title: "",
                exercises: [
                    {
                        index: 0,
                        type: "reorder",
                        mode: "translate",
                        questionText: "Test question",
                        solutionTokens: "token1, token2",
                        distractorTokens: "",
                    },
                ],
            } as Lesson,
            expected: false,
        },
        {
            name: "Invalid lesson (empty exercises)",
            lesson: {
                title: "Test Lesson",
                exercises: [],
            } as Lesson,
            expected: false,
        },
    ];

    for (const test of validateTests) {
        const result = validateLesson(test.lesson);
        if (result.isValid === test.expected) {
            console.log(`✓ ${test.name}`);
            passed++;
        } else {
            console.log(`✗ ${test.name}`);
            console.log(`  Expected isValid: ${test.expected}`);
            console.log(`  Got: ${result.isValid}`);
            if (result.error) console.log(`  Error: ${result.error}`);
            failed++;
        }
    }

    console.log("\n--- validateExercise tests ---");

    const exerciseTests = [
        {
            name: "Valid exercise",
            exercise: {
                index: 0,
                type: "reorder",
                mode: "translate",
                questionText: "Test question",
                solutionTokens: "token1, token2",
                distractorTokens: "",
            } as Exercise,
            expected: null,
        },
        {
            name: "Invalid exercise (empty question)",
            exercise: {
                index: 0,
                type: "reorder",
                mode: "translate",
                questionText: "",
                solutionTokens: "token1, token2",
                distractorTokens: "",
            } as Exercise,
            expected: "questionText cannot be empty",
        },
        {
            name: "Invalid exercise (empty solution tokens)",
            exercise: {
                index: 0,
                type: "reorder",
                mode: "translate",
                questionText: "Test question",
                solutionTokens: "",
                distractorTokens: "",
            } as Exercise,
            expected: "solutionTokens must contain at least one token",
        },
    ];

    for (const test of exerciseTests) {
        const result = validateExercise(test.exercise);
        if ((result === null && test.expected === null) || (result && result.includes(test.expected as string))) {
            console.log(`✓ ${test.name}`);
            passed++;
        } else {
            console.log(`✗ ${test.name}`);
            console.log(`  Expected: ${test.expected}`);
            console.log(`  Got: ${result}`);
            failed++;
        }
    }

    console.log("\n--- sanitizeExercise tests ---");

    const sanitizeTests = [
        {
            name: "Sanitize valid exercise",
            exercise: {
                index: 0,
                type: "reorder",
                mode: "translate",
                questionText: "  Test question  ",
                solutionTokens: "  token1, token2  ",
                distractorTokens: "  distractor1, distractor2  ",
            } as Exercise,
            allowedTypes: ["reorder"],
            allowedModes: ["translate"],
            expected: {
                type: "reorder",
                mode: "translate",
                questionText: "Test question",
                solutionTokens: "token1, token2",
                distractorTokens: "distractor1, distractor2",
            },
        },
        {
            name: "Default invalid type and mode",
            exercise: {
                index: 0,
                type: "invalid_type",
                mode: "invalid_mode",
                questionText: "Test question",
                solutionTokens: "token1, token2",
                distractorTokens: "",
            } as Exercise,
            allowedTypes: ["reorder"],
            allowedModes: ["translate"],
            expected: {
                type: "reorder",
                mode: "translate",
            },
        },
        {
            name: "Remove duplicate distractors (case-insensitive)",
            exercise: {
                index: 0,
                type: "reorder",
                mode: "translate",
                questionText: "Test question",
                solutionTokens: "token1, token2",
                distractorTokens: "Distractor1, distractor1, Distractor2",
            } as Exercise,
            allowedTypes: ["reorder"],
            allowedModes: ["translate"],
            expected: {
                solutionTokens: "token1, token2",
                distractorTokens: "Distractor1, Distractor2",
            },
        },
        {
            name: "Remove distractors matching solution (case-insensitive)",
            exercise: {
                index: 0,
                type: "reorder",
                mode: "translate",
                questionText: "Test question",
                solutionTokens: "token1, token2",
                distractorTokens: "Token1, Distractor2, TOKEN2",
            } as Exercise,
            allowedTypes: ["reorder"],
            allowedModes: ["translate"],
            expected: {
                solutionTokens: "token1, token2",
                distractorTokens: "Distractor2",
            },
        },
    ];

    for (const test of sanitizeTests) {
        const result = sanitizeExercise(
            test.exercise,
            0,
            test.allowedTypes,
            test.allowedModes
        );

        const matches = Object.entries(test.expected).every(
            ([key, value]) => result[key as keyof typeof result] === value
        );

        if (matches) {
            console.log(`✓ ${test.name}`);
            passed++;
        } else {
            console.log(`✗ ${test.name}`);
            console.log(`  Expected:`, test.expected);
            console.log(`  Got:`, {
                type: result.type,
                mode: result.mode,
                questionText: result.questionText,
                solutionTokens: result.solutionTokens,
                distractorTokens: result.distractorTokens,
            });
            failed++;
        }
    }

    console.log("\n--- reindexExercises tests ---");

    const reindexTests = [
        {
            name: "Reindex exercises with gaps",
            exercises: [
                { index: 5, type: "reorder", mode: "translate", questionText: "Q1", solutionTokens: "t1", distractorTokens: "" },
                { index: 10, type: "reorder", mode: "translate", questionText: "Q2", solutionTokens: "t2", distractorTokens: "" },
                { index: 15, type: "reorder", mode: "translate", questionText: "Q3", solutionTokens: "t3", distractorTokens: "" },
            ] as Exercise[],
            expected: [0, 1, 2],
        },
    ];

    for (const test of reindexTests) {
        const result = reindexExercises(test.exercises);
        const actualIndexes = result.map((e) => e.index);

        if (JSON.stringify(actualIndexes) === JSON.stringify(test.expected)) {
            console.log(`✓ ${test.name}`);
            passed++;
        } else {
            console.log(`✗ ${test.name}`);
            console.log(`  Expected indexes: ${test.expected}`);
            console.log(`  Got indexes: ${actualIndexes}`);
            failed++;
        }
    }

    console.log("\n--- sanitizeLesson tests ---");

    const sanitizeLessonTests = [
        {
            name: "Sanitize lesson (truncate title)",
            lesson: {
                title: "A".repeat(200),
                exercises: [
                    {
                        index: 0,
                        type: "reorder",
                        mode: "translate",
                        questionText: "Test question",
                        solutionTokens: "token1, token2",
                        distractorTokens: "",
                    },
                ],
            } as Lesson,
            allowedTypes: ["reorder"],
            allowedModes: ["translate"],
            expectedTitleLength: 120,
        },
    ];

    for (const test of sanitizeLessonTests) {
        const result = sanitizeLesson(test.lesson, test.allowedTypes, test.allowedModes);

        if (result.title.length === test.expectedTitleLength) {
            console.log(`✓ ${test.name}`);
            passed++;
        } else {
            console.log(`✗ ${test.name}`);
            console.log(`  Expected title length: ${test.expectedTitleLength}`);
            console.log(`  Got: ${result.title.length}`);
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
