import LessonPlayer from "./LessonPlayer";

type Props = {
    params: { lessonId: string };
};

export default async function LessonPage({ params }: Props) {
    const { lessonId } = await params;
    return <LessonPlayer lessonId={lessonId} />;
}