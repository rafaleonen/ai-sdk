import { NextRequest, NextResponse } from "next/server";
import { generateText, isStepCount, tool } from "ai";
import { claudeCode } from "@/lib/claude-code";
import z from "zod";

/*
  Agente de IA

  STEP 01: Pergunta -> Github
  STEP 02: Pergunta + Dados do Github
  STEP 03: Pergunta + Dados do Github -> Fetch URL (organizations)
*/

export async function GET(request: NextRequest) {
  try {
    const result = await generateText({
      model: claudeCode("sonnet"),
      tools: {
        githubProfile: tool({
          description:
            "Essa ferramenta serve para buscar dados de um usuário no github ou acessar URLs da API para outras informações de um usuário, como lista de organizações, repositórios, eventos, seguidores, seguindo etc",
          inputSchema: z.object({
            username: z.string().describe("Username do usuário no Github"),
          }),
          execute: async ({ username }) => {
            const response = await fetch(
              `https://api.github.com/users/${username}`,
              { headers: { "User-Agent": "api-sdk" } },
            );

            if (!response.ok) {
              return { error: `GitHub retornou ${response.status}` };
            }

            return await response.json();
          },
        }),
        fetchHttp: tool({
          description:
            "Essa ferramenta server para realizar uma requisição HTTP em uma URL especifícada",
          inputSchema: z.object({
            url: z.url().describe("URL a ser requisitada"),
          }),
          execute: async ({ url }) => {
            const response = await fetch(url);
            const data = response.text();

            return data;
          },
        }),
      },
      prompt: "Quais organizações o usuário rafaleonen faz parte no Github?",
      stopWhen: isStepCount(5),
      // onStepStart: ({  }) => console.log("Começando step..."),
      onStepEnd: ({ toolResults }) =>
        console.log("Finalizando step...", toolResults),
    });

    return NextResponse.json({
      message: result.text,
      parts: result.toolResults,
    });
  } catch (err: unknown) {
    return NextResponse.json({ message: err });
  }
}
