import { createLesson } from "../../../../lib/lessonActions";

export async function POST(request: Request) {
    const { userPrompt } = await request.json()

    const lesson = await createLesson(userPrompt);

    return new Response(JSON.stringify(lesson), {
        headers: { "Content-Type": "application/json" },
        status: 201,
    });
}

export async function GET() {
    return new Response(JSON.stringify({
        message: "Hello"
    }))
}