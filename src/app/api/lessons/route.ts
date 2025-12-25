import { NextResponse } from "next/server";
import { createLesson } from "../../../lib/lessonActions";
import { CreateLessonRequest, CreateLessonResponse } from "../../../types/domain";
import { ZodError } from "zod";

export async function POST(request: Request) {
    try {
        const body: CreateLessonRequest = await request.json();

        const result = await createLesson(body);

        const response: CreateLessonResponse = {
            lessonId: result.lessonId,
            title: result.generatedLesson.title,
            aiFallbackUsed: result.aiFallbackUsed,
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            // structured validation error from Zod
            return NextResponse.json({ message: "Invalid request", details: error.issues }, { status: 400 });
        }

        const message = error instanceof Error ? error.message : "Failed to create lesson";

        if (message.includes("must be at least") ||
            message.includes("cannot exceed") ||
            message.includes("Invalid difficulty level") ||
            message.includes("must be a non-empty array")) {
            return NextResponse.json({ message }, { status: 400 });
        }

        if (message.includes("AI_PROVIDER_ERROR") || message.includes("AI_TIMEOUT_ERROR")) {
            return NextResponse.json({ message: "AI service unavailable. Please try again later." }, { status: 503 });
        }

        return NextResponse.json({ message }, { status: 500 });
    }
}
