"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLesson } from "./hooks/useLesson";
import { useLessonGame } from "./hooks/useLessonGame";
import { ExerciseProgress } from "./components/ExerciseProgress";
import { QuestionDisplay } from "./components/QuestionDisplay";
import { TokenBank } from "./components/TokenBank";
import { AnswerArea } from "./components/AnswerArea";
import { LessonSummary } from "./components/LessonSummary";

export default function LessonPlayer({ lessonId }: { lessonId: string }) {

    // use Lesson Hook to fetch data
    const {
        lesson,
        exercises,
        isLoading,
        error,
        notFound
    } = useLesson(lessonId);

    // use Lesson Game Hook to manage game state
    const {
        currentIndex,
        currentAnswerTokens,
        usedTokenIndexes,
        bankTokensOrder,
        locked,
        answers,
        showSummary,
        selectToken,
        clearCurrent,
        checkAnswer,
        goNext
    } = useLessonGame(exercises);

    const correctCount = useMemo(() => {
        return Object.values(answers).filter((a) => a.isCorrect).length;
    }, [answers]);

    if (isLoading) {
        return <div>Loading lesson...</div>;
    }

    if (notFound) {
        return (
            <div>
                <p>Lesson not found.</p>
                <Link href="/">Back to home</Link>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <p>{error}</p>
                <Link href="/">Back to home</Link>
            </div>
        );
    }

    if (!lesson) {
        return <div>No lesson data.</div>;
    }

    if (showSummary) {
        return <LessonSummary correctCount={correctCount} totalExercises={exercises.length} />;
    }

    const exercise = exercises[currentIndex];
    if (!exercise) {
        return <div>No exercise data.</div>;
    }

    const exerciseId = exercise.id || `exercise-${exercise.index}`;

    return (
        <main>
            <header>
                <h1>{lesson.title}</h1>
            </header>
            <section>
                <ExerciseProgress current={currentIndex} total={exercises.length} />
                <QuestionDisplay questionText={exercise.questionText} lang={exercise.sourceLanguage} />
                <TokenBank
                    tokens={bankTokensOrder}
                    usedTokenIndexes={usedTokenIndexes}
                    locked={locked}
                    onSelectToken={selectToken}
                />
                <AnswerArea
                    answerTokens={currentAnswerTokens}
                    locked={locked}
                    exerciseId={exerciseId}
                    exerciseSolution={exercise.solutionTokens}
                    questionText={exercise.questionText}
                    answers={answers}
                    currentIndex={currentIndex}
                    totalExercises={exercises.length}
                    answerLang={exercise.targetLanguage || lesson?.exercises?.[0]?.targetLanguage || "en"}
                    sourceLang={exercise.sourceLanguage}
                    onClear={clearCurrent}
                    onCheckAnswer={() => checkAnswer(exercise)}
                    onNext={goNext}
                />
            </section>
        </main>
    );
}
