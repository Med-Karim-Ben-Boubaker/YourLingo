import { NextResponse } from "next/server";
import { createCorrectionExplanation } from "../../../../lib/correctionActions";
import { ZodError, z } from "zod";

const CorrectionRequestSchema = z.object({
    questionText: z.string().min(1),
    userAnswer: z.string().min(1),
    correctAnswer: z.string().min(1),
    sourceLanguage: z.string().optional(),
    targetLanguage: z.string().optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const parsed = CorrectionRequestSchema.parse(body);

        const result = await createCorrectionExplanation(parsed);

        return NextResponse.json(
            { correctAnswer: result.correctAnswer, explanation: result.explanation, aiFallbackUsed: result.aiFallbackUsed },
            { status: 200 }
        );
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            return NextResponse.json({ message: "Invalid request", details: error.issues }, { status: 400 });
        }

        const message = error instanceof Error ? error.message : "Failed to create correction explanation";

        if (message.includes("must be at least") ||
            message.includes("cannot exceed") ||
            message.includes("Invalid difficulty level") ||
            message.includes("must be a non-empty array") ||
            message.includes("Invalid request")) {
            return NextResponse.json({ message }, { status: 400 });
        }

        if (message.includes("AI_PROVIDER_ERROR") || message.includes("AI_TIMEOUT_ERROR")) {
            return NextResponse.json({ message: "AI service unavailable. Please try again later." }, { status: 503 });
        }

        return NextResponse.json({ message }, { status: 500 });
    }
}


