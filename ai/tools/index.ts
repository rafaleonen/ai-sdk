import type { InferUITools, UIDataTypes, UIMessage } from "ai";
import { fetchHttp } from "./fetch-http";
import { githubProfile } from "./github-profile";

export const tools = {
  githubProfile,
  fetchHttp,
};

export type AIToolSet = InferUITools<typeof tools>;
export type AIUIMessage = UIMessage<never, UIDataTypes, AIToolSet>;
