import { NextRequest } from "next/server";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  tool,
  toUIMessageStream,
  UIMessage,
} from "ai";
import { claudeCode } from "@/lib/claude-code";
import z from "zod";
import { tools } from "@/ai/tools";

export async function POST(request: NextRequest) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const result = streamText({
    model: claudeCode("sonnet"),
    tools: tools,
    prompt: await convertToModelMessages(messages),
    instructions: `
        Sempre responsa em markdown sem aspas no início ou fim da mensagem.
      `,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
