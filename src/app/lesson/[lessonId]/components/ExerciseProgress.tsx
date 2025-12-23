export function ExerciseProgress({ current, total }: { current: number; total: number }) {
    return (
        <div>
            <strong>
                {current + 1} of {total}
            </strong>
        </div>
    );
}
