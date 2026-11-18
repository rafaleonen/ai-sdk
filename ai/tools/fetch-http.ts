import { tool } from "ai";
import z from "zod";

export const fetchHttp = tool({
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
});
