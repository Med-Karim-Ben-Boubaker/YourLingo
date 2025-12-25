import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { ContentGeneratorService, GenerationParams } from "./types";
import { Lesson } from "../../types/domain";
import { generatorConfig } from "../config/generatorConfig";
import { validateLesson, sanitizeLesson } from "../validators/lessonValidator";

export class LLMContentGenerator implements ContentGeneratorService {
    async generateExercises(promptText: string, params: GenerationParams): Promise<Lesson> {
        const systemPrompt = this.buildSystemPrompt(params);

        try {
            const result = await generateText({
                model: google(generatorConfig.model),
                prompt: `Generate a language learning lesson from this prompt: "${promptText}"`,
                system: systemPrompt,
                temperature: 0.7,
            });

            const lesson = this.parseAIResponse(result.text);

            const sanitized = sanitizeLesson(lesson, params.allowedExerciseTypes, params.allowedModes);

            const validation = validateLesson(sanitized);
            if (!validation.isValid) {
                throw new Error(`AI generated invalid lesson: ${validation.error}`);
            }

            return sanitized;
        } catch (error) {
            if (this.isAIFailure(error)) {
                throw error;
            }
            throw new Error(`AI generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    private buildSystemPrompt(params: GenerationParams): string {
        return `You are a German language learning content generator. Generate JSON ONLY - no markdown, no code fences, no extra commentary.

Generate a lesson with the following constraints:
- title: max ${generatorConfig.titleMaxLength} characters, relevant to the topic
- exercises: between ${params.minExercises} and ${params.maxExercises} items
- exercise type(s): ${params.allowedExerciseTypes.join(", ")}
- mode(s): ${params.allowedModes.join(", ")}
- difficulty: ${params.difficultyLevel} (A1=beginner, A2=elementary, B1=intermediate, B2=upper-intermediate)
- solutionTokens: ${generatorConfig.minSolutionTokens}-${generatorConfig.maxSolutionTokens} tokens
- distractorTokens: 0-${generatorConfig.maxDistractorTokens} tokens
- token delimiter: ", " (comma + space)

Content should be learner-friendly and appropriate for ${params.difficultyLevel} level.
Each exercise should be a practical, realistic language learning scenario.
shuffle between generating translation from english to german and german to english.

Return JSON with this exact structure (no extra fields):
{
  "title": "Lesson Title",
  "exercises": [
    {
      "index": 0,
      "type": "reorder",
      "mode": "translate",
      "questionText": "Question text here",
      "solutionTokens": "token1, token2, token3",
      "distractorTokens": "maybe, extra"
    }
  ]
}`;
    }

    private parseAIResponse(text: string): Lesson {
        // Strip markdown code fences if present (model sometimes ignores "no code fences" instruction)
        let cleanedText = text.trim();
        const codeFenceMatch = cleanedText.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
        if (codeFenceMatch) {
            cleanedText = codeFenceMatch[1];
        }
        try {
            return JSON.parse(cleanedText) as Lesson;
        } catch {
            throw new Error("Failed to parse AI response as JSON");
        }
    }

    private isAIFailure(error: unknown): boolean {
        if (error instanceof Error) {
            return error.message.includes("AI_PROVIDER_ERROR") ||
                   error.message.includes("AI_TIMEOUT_ERROR") ||
                   error.message.includes("Failed to parse AI response");
        }
        return false;
    }
}
