import { NextRequest, NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { claudeCode } from "@/lib/ai/claude-code";
import z from "zod";

export async function GET(request: NextRequest) {
  try {
    const result = await generateText({
      model: claudeCode("haiku"),
      output: Output.object({
        schema: z.object({
          pt: z.string().describe("Tradução para português"),
          fr: z.string().describe("Tradução para francês"),
          es: z.string().describe("Tradução para espanhol"),
        }),
      }),
      prompt: 'Traduza "Hello World" para diferentes idiomas',
      instructions:
        "Você é uma IA especializada em tradução, sempre retorno da maneira mais sucinta possível",
    });

    return NextResponse.json({ message: result.output });
  } catch (err: unknown) {
    return NextResponse.json({ message: err });
  }
}
