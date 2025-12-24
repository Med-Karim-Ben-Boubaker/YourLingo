import { useReducer, useEffect } from "react";
import { Exercise } from "../../../../types/domain";
import { parseTokens } from "../../../../lib/utils/tokenParser";
import { shuffleArray } from "../../../../lib/utils/arrayUtils";

interface GameState {
    currentIndex: number;
    currentAnswerTokens: string[];
    usedTokenIndexes: Set<number>;
    bankTokensOrder: string[];
    locked: boolean;
    answers: Record<string, { isCorrect: boolean }>;
    showSummary: boolean;
}

type GameAction =
    | { type: "SELECT_TOKEN"; token: string; index: number }
    | { type: "CLEAR_CURRENT" }
    | { type: "CHECK_ANSWER"; exercise: Exercise }
    | { type: "GO_NEXT"; totalExercises: number }
    | { type: "RESET_EXERCISE"; exercise: Exercise | null };

function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
        case "SELECT_TOKEN": {
            if (state.locked) return state;
            if (state.usedTokenIndexes.has(action.index)) return state;
            const next = new Set(state.usedTokenIndexes);
            next.add(action.index);
            return {
                ...state,
                currentAnswerTokens: [...state.currentAnswerTokens, action.token],
                usedTokenIndexes: next
            };
        }

        case "CLEAR_CURRENT": {
            if (state.locked) return state;
            return {
                ...state,
                currentAnswerTokens: [],
                usedTokenIndexes: new Set()
            };
        }

        case "CHECK_ANSWER": {
            const solution = parseTokens(String(action.exercise.solutionTokens));
            const user = state.currentAnswerTokens;
            const isCorrect =
                user.length === solution.length &&
                user.every(
                    (t, i) => t.toLowerCase() === (solution[i] || "").toLowerCase()
                );
            const exerciseId = action.exercise.id || `exercise-${action.exercise.index}`;
            return {
                ...state,
                locked: true,
                answers: { ...state.answers, [exerciseId]: { isCorrect } }
            };
        }

        case "GO_NEXT": {
            if (state.currentIndex + 1 >= action.totalExercises) {
                return { ...state, showSummary: true };
            }
            return { ...state, currentIndex: state.currentIndex + 1 };
        }

        case "RESET_EXERCISE": {
            if (!action.exercise) {
                return {
                    ...state,
                    currentAnswerTokens: [],
                    usedTokenIndexes: new Set(),
                    bankTokensOrder: [],
                    locked: false
                };
            }

            const solutionArray = parseTokens(String(action.exercise.solutionTokens));
            const distractorArray = parseTokens(String(action.exercise.distractorTokens));
            return {
                ...state,
                currentAnswerTokens: [],
                usedTokenIndexes: new Set(),
                bankTokensOrder: shuffleArray([...solutionArray, ...distractorArray]),
                locked: false
            };
        }

        default:
            return state;
    }
}

export function useLessonGame(exercises: Exercise[]) {
    const initialState: GameState = {
        currentIndex: 0,
        currentAnswerTokens: [],
        usedTokenIndexes: new Set(),
        bankTokensOrder: [],
        locked: false,
        answers: {},
        showSummary: false
    };

    const [state, dispatch] = useReducer(gameReducer, initialState);

    useEffect(() => {
        const exercise = exercises[state.currentIndex];
        dispatch({ type: "RESET_EXERCISE", exercise });
    }, [state.currentIndex, exercises]);

    return {
        currentIndex: state.currentIndex,
        currentAnswerTokens: state.currentAnswerTokens,
        usedTokenIndexes: state.usedTokenIndexes,
        bankTokensOrder: state.bankTokensOrder,
        locked: state.locked,
        answers: state.answers,
        showSummary: state.showSummary,
        selectToken: (token: string, index: number) => 
            dispatch({ type: "SELECT_TOKEN", token, index }),
        clearCurrent: () => dispatch({ type: "CLEAR_CURRENT" }),
        checkAnswer: (exercise: Exercise) => 
            dispatch({ type: "CHECK_ANSWER", exercise }),
        goNext: () => dispatch({ type: "GO_NEXT", totalExercises: exercises.length })
    };
}
