import { NextResponse } from "next/server";
import { getFullLesson } from "../../../../lib/lessonActions";

export async function GET(_request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
    const { lessonId } = await params;

    try {
        const payload = await getFullLesson(lessonId);
        return NextResponse.json(payload, { status: 200 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Lesson not found";
        if (message.includes("Lesson not found")) {
            return NextResponse.json({ message }, { status: 404 });
        }
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
