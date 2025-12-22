import { findLesson, getFullLesson } from "../../../../../lib/lessonActions";

export async function GET(request: Request, { params }: { params?: { lessonId?: string } } = {}) {
    // Unwrap params if it's a Promise (Next.js may pass a Promise here)
    const paramObj = params && typeof (params as any).then === "function" ? await params : params;
    const lessonId = paramObj?.lessonId;

    if (!lessonId) {
        return new Response(JSON.stringify({ message: "Missing lessonId parameter" }), {
            headers: { "Content-Type": "application/json" },
            status: 400,
        });
    }

    try {
        const payload = await getFullLesson(lessonId);

        return new Response(JSON.stringify(payload), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (err: any) {
        console.error("Error in GET /api/lessons/[lessonId]:", err);
        const msg = String(err?.message || "");
        if (msg.includes("Lesson not found")) {
            return new Response(JSON.stringify({ message: "Lesson not found" }), {
                headers: { "Content-Type": "application/json" },
                status: 404,
            });
        }
        return new Response(JSON.stringify({ message: "Server error" }), {
            headers: { "Content-Type": "application/json" },
            status: 500,
        });
    }
}