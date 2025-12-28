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

    async generateCorrectionExplanation(
        questionText: string,
        userAnswer: string,
        correctAnswer: string,
        params: GenerationParams
    ): Promise<{ correctAnswer: string; explanation: string }> {
        const systemPrompt = `You are a concise language teacher. Return JSON ONLY with two fields: "correctAnswer" (the corrected target-language sentence) and "explanation" (1-3 short sentences in English). Focus the explanation on the German side: describe the German grammatical or lexical issue that makes the user's answer incorrect or non-idiomatic. Write the explanation in clear English, do not include translations of the whole sentence, examples, or extra fields. Keep the explanation minimal and focused on German grammar or word choice.`;

        const userPrompt = `Question: "${questionText}"
UserAnswer: "${userAnswer}"
CorrectAnswer: "${correctAnswer}"
TargetLanguage: "${params.targetLanguage}"

Provide the corrected sentence (use the CorrectAnswer if it is the best phrasing) and a very short English explanation (1-3 sentences) that explains the problem from the German side—what in the German sentence/wording is incorrect or misleading and why.`;

        try {
            const result = await generateText({
                model: google(generatorConfig.model),
                prompt: userPrompt,
                system: systemPrompt,
                temperature: 0.2,
            });

            let cleaned = result.text.trim();
            const fenceMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
            if (fenceMatch) {
                cleaned = fenceMatch[1];
            }

            try {
                const parsed = JSON.parse(cleaned);
                return {
                    correctAnswer: String(parsed.correctAnswer ?? correctAnswer),
                    explanation: String(parsed.explanation ?? ""),
                };
            } catch {
                // Attempt to recover if the model returned a short two-line text: first line corrected sentence, rest explanation
                const lines = cleaned.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
                if (lines.length >= 1) {
                    const first = lines[0].replace(/^["']|["']$/g, "");
                    const rest = lines.slice(1).join(" ");
                    return {
                        correctAnswer: first || correctAnswer,
                        explanation: rest || "",
                    };
                }
                throw new Error("Failed to parse AI response");
            }
        } catch (error) {
            if (this.isAIFailure(error)) {
                throw error;
            }
            throw new Error(`AI_PROVIDER_ERROR: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    private buildSystemPrompt(params: GenerationParams): string {
        return `You are a ${params.targetLanguage} language learning content generator. Generate JSON ONLY - no markdown, no code fences, no extra commentary.

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
shuffle between generating translations from ${params.sourceLanguage} to ${params.targetLanguage} and from ${params.targetLanguage} to ${params.sourceLanguage}.

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
      , "sourceLanguage": "${params.sourceLanguage}"
      , "targetLanguage": "${params.targetLanguage}"
    }
  ]
}`;
    }

    private parseAIResponse(text: string): Lesson {
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
