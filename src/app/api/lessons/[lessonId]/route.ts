import { findLesson } from "../../../../../lib/lessonActions";

export async function GET(request: Request, { params }: { params: { lessonId: string } }) {

    const { lessonId } = await params;

    const lesson = await findLesson(lessonId);

    return new Response(JSON.stringify(lesson), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    })

}