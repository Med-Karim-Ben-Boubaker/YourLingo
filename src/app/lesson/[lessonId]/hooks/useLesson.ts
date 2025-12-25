import { useEffect, useState } from "react";
import { Lesson, Exercise } from "../../../../types/domain";

export function useLesson(lessonId: string) {
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);

    useEffect(() => {
        const abortController = new AbortController();
        
        async function load() {
            setIsLoading(true);
            setNotFound(false);
            setError(null);
            
            try {
                const res = await fetch(`/api/lessons/${lessonId}`, {
                    signal: abortController.signal
                });
                
                if (res.status === 404) {
                    setNotFound(true);
                    return;
                }
                
                const payload: Lesson = await res.json();
                setLesson(payload);
                setExercises(payload.exercises.sort((a: Exercise, b: Exercise) => a.index - b.index));
            } catch {
                if (abortController.signal.aborted) return;
                setError("Failed to load lesson.");
            } finally {
                setIsLoading(false);
            }
        }
        
        load();
        
        return () => {
            abortController.abort();
        };
    }, [lessonId]);

    return { lesson, exercises, isLoading, error, notFound };
}
