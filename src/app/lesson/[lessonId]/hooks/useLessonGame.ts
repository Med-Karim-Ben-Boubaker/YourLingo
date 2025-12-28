import { useReducer, useEffect } from "react";
import { Exercise } from "../../../../types/domain";
import { parseTokens } from "../../../../lib/utils/tokenParser";
import { shuffleArray } from "../../../../lib/utils/arrayUtils";

interface GameState {
    // queue-driven state
    playQueue: number[]; // indices of exercises to play
    queuePointer: number; // pointer into playQueue
    phase: "initial" | "correction";
    exerciseIds: string[]; // maps exercise indices to actual IDs from database

    // exercise UI state
    currentAnswerTokens: string[];
    usedTokenIndexes: Set<number>;
    bankTokensOrder: string[];
    locked: boolean;

    // answers map: store isCorrect and attempts
    answers: Record<string, { isCorrect: boolean; attempts: number }>;
    showSummary: boolean;
    // correction snapshot info
    correctionInitialTotal: number | null;
}

type GameAction =
    | { type: "SELECT_TOKEN"; token: string; index: number }
    | { type: "CLEAR_CURRENT" }
    | { type: "CHECK_ANSWER"; exercise: Exercise }
    | { type: "INIT_QUEUE"; queue: number[]; exerciseIds: string[] }
    | { type: "GO_NEXT"; totalExercises: number }
    | { type: "RESET_EXERCISE"; exercise: Exercise | null };

function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
        case "INIT_QUEUE": {
            return {
                ...state,
                playQueue: action.queue,
                queuePointer: 0,
                phase: "initial",
                exerciseIds: action.exerciseIds,
                correctionInitialTotal: null
            };
        }

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
            const prev = state.answers[exerciseId];
            const attempts = (prev?.attempts || 0) + 1;
            return {
                ...state,
                locked: true,
                answers: {
                    ...state.answers,
                    [exerciseId]: { isCorrect, attempts }
                }
            };
        }

        case "GO_NEXT": {
            // Only called when current is locked (user checked)
            const RETRY_LIMIT = 3;
            const { playQueue, queuePointer, phase, exerciseIds } = state;
            if (!playQueue || playQueue.length === 0) {
                return { ...state, showSummary: true };
            }

            const currentQueueIndex = queuePointer;
            const currentExerciseIdx = playQueue[currentQueueIndex];
            const exerciseId = exerciseIds[currentExerciseIdx];
            const answerData = state.answers[exerciseId];

            // Helper to remove current pointer item
            const removeAtPointer = (arr: number[], ptr: number) => {
                const copy = [...arr];
                copy.splice(ptr, 1);
                return copy;
            };

            // Phase handling
            if (phase === "initial") {
                if (currentQueueIndex + 1 < playQueue.length) {
                    return { ...state, queuePointer: currentQueueIndex + 1, locked: false };
                }
                // finished initial pass -> build correction queue
                const correctionQueue = playQueue.filter((idx) => {
                    const id = exerciseIds[idx];
                    return !(state.answers[id] && state.answers[id].isCorrect);
                });
                if (correctionQueue.length === 0) {
                    return { ...state, showSummary: true };
                }
                return {
                    ...state,
                    playQueue: correctionQueue,
                    queuePointer: 0,
                    phase: "correction",
                    correctionInitialTotal: correctionQueue.length,
                    locked: false
                };
            }

            // correction phase
            if (phase === "correction") {
                // if answered correct -> remove from queue
                if (answerData && answerData.isCorrect) {
                    const nextQueue = removeAtPointer(playQueue, currentQueueIndex);
                    if (nextQueue.length === 0) {
                        return { ...state, playQueue: nextQueue, showSummary: true };
                    }
                    // don't advance pointer; next item occupies same index
                    const newPointer = currentQueueIndex >= nextQueue.length ? 0 : currentQueueIndex;
                    return { ...state, playQueue: nextQueue, queuePointer: newPointer, locked: false };
                }

                // answered incorrect in correction phase
                const attempts = answerData?.attempts || 0;
                if (attempts >= RETRY_LIMIT) {
                    // remove from queue permanently
                    const nextQueue = removeAtPointer(playQueue, currentQueueIndex);
                    if (nextQueue.length === 0) {
                        return { ...state, playQueue: nextQueue, showSummary: true };
                    }
                    const newPointer = currentQueueIndex >= nextQueue.length ? 0 : currentQueueIndex;
                    return { ...state, playQueue: nextQueue, queuePointer: newPointer, locked: false };
                }

                // push to end of queue
                const item = playQueue[currentQueueIndex];
                const nextQueue = removeAtPointer(playQueue, currentQueueIndex);
                nextQueue.push(item);
                // next item now occupies current index
                const newPointer = currentQueueIndex >= nextQueue.length ? 0 : currentQueueIndex;
                return { ...state, playQueue: nextQueue, queuePointer: newPointer, locked: false };
            }

            return state;
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
        playQueue: [],
        queuePointer: 0,
        phase: "initial",
        exerciseIds: [],
        currentAnswerTokens: [],
        usedTokenIndexes: new Set(),
        bankTokensOrder: [],
        locked: false,
        answers: {},
        showSummary: false,
        correctionInitialTotal: null
    };

    const [state, dispatch] = useReducer(gameReducer, initialState);

    // initialize play queue on exercises load
    useEffect(() => {
        if (exercises && exercises.length > 0) {
            const queue = exercises.map((_, i) => i);
            const exerciseIds = exercises.map((e) => e.id || `exercise-${e.index}`);
            dispatch({ type: "INIT_QUEUE", queue, exerciseIds });
        }
    }, [exercises]);

    // reset exercise tokens whenever current pointer or playQueue changes
    useEffect(() => {
        const { playQueue, queuePointer } = state;
        if (!playQueue || playQueue.length === 0) {
            dispatch({ type: "RESET_EXERCISE", exercise: null });
            return;
        }
        const exerciseIndex = playQueue[queuePointer];
        const exercise = exercises[exerciseIndex];
        dispatch({ type: "RESET_EXERCISE", exercise });
    }, [state.playQueue, state.queuePointer, exercises]);

    return {
        // expose logical current index into original exercises array
        currentIndex:
            state.playQueue && state.playQueue.length > 0
                ? state.playQueue[state.queuePointer]
                : 0,
        // queue UI info
        playQueuePosition: state.queuePointer,
        playQueueLength: state.playQueue.length,
        isCorrectionPhase: state.phase === "correction",
        correctionInitialTotal: state.correctionInitialTotal,

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

// export reducer for unit testing
export { gameReducer };
