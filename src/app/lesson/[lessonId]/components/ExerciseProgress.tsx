interface ExerciseProgressProps {
    current: number;
    total: number;
    isCorrectionPhase?: boolean;
    correctionPosition?: number;
    correctionTotal?: number;
}

export function ExerciseProgress({
    current,
    total,
    isCorrectionPhase,
    correctionPosition,
    correctionTotal
}: ExerciseProgressProps) {
    if (isCorrectionPhase) {
        const pos = (correctionPosition ?? 0) + 1;
        const tot = correctionTotal ?? 0;
        return (
            <div>
                <strong>
                    {pos} of {tot} remaining
                </strong>
            </div>
        );
    }
    return (
        <div>
            <strong>
                {current + 1} of {total}
            </strong>
        </div>
    );
}
