import Link from "next/link";

interface LessonSummaryProps {
    correctCount: number;
    totalExercises: number;
}

export function LessonSummary({ correctCount, totalExercises }: LessonSummaryProps) {
    return (
        <div>
            <h2>Summary</h2>
            <p>
                You got {correctCount} / {totalExercises} correct.
            </p>
            <Link href="/">Back to home</Link>
        </div>
    );
}
