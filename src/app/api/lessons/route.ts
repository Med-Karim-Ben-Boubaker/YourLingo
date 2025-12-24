import { NextResponse } from "next/server";
import { createLesson } from "../../../lib/lessonActions";
import { CreateLessonRequest, CreateLessonResponse } from "../../../types/domain";

export async function POST(request: Request) {
    try {
        const body: CreateLessonRequest = await request.json();
        const { userPrompt } = body;
        
        const result = await createLesson(userPrompt);
        
        const response: CreateLessonResponse = {
            lessonId: result.lessonId,
            title: result.generatedLesson.title
        };
        
        return NextResponse.json(response, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to create lesson";
        return NextResponse.json(
            { message },
            { status: 500 }
        );
    }
}
