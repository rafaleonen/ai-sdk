"use client";

import { Bot, User2 } from "lucide-react";
import { ChatScrollToBottomButton } from "./chat-scroll-to-bottom-button";
import { ComponentProps, useEffect, useRef, useState } from "react";
import { MessageInput } from "./message-input";
import { Markdown } from "./markdown";
import { useChat } from "@ai-sdk/react";
import { ToolLoading } from "./tool-loading";
import { GithubProfile } from "./github-profile";
import { DefaultChatTransport, getToolName, isToolUIPart } from "ai";
import { AIUIMessage } from "@/ai/tools";

type GithubUser = ComponentProps<typeof GithubProfile>["user"];

const toolLoadingText: Record<string, string> = {
  githubProfile: "Carregando informações do GitHub...",
  httpFetch: "Realizando requisição HTTP...",
};

export function Chat() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat<AIUIMessage>({
    transport: new DefaultChatTransport({ api: "/api/ai" }),
  });

  const isBusy = status === "streaming" || status === "submitted";

  function handleSubmit(event?: { preventDefault?: () => void }) {
    event?.preventDefault?.();

    const text = input.trim();
    if (!text || isBusy) return;

    sendMessage({ text });
    setInput("");
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "instant",
      });
    }
  }, []);

  useEffect(() => {
    console.log("messages : ", messages);
    if (messages.length > 0 && status === "streaming" && containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, status]);

  return (
    <>
      <div className="flex-1 relative">
        <div
          ref={containerRef}
          className="space-y-6 absolute inset-0 overflow-y-scroll scrollbar scrollbar-thumb-rounded-full scrollbar-thumb-zinc-900 scrollbar-track-transparent"
        >
          {messages.map((message) => {
            return (
              <div key={message.id} className="flex items-start gap-3">
                {message.role === "user" && (
                  <div className="size-7 rounded-md bg-zinc-900 flex items-center justify-center">
                    <User2 className="size-4 text-zinc-100" />
                  </div>
                )}

                {message.role === "assistant" && (
                  <div className="size-7 rounded-md bg-zinc-900 flex items-center justify-center">
                    <Bot className="size-4 text-zinc-400" />
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  {message.parts.map((part, index) => {
                    if (part.type === "text") {
                      if (!part.text) return null;

                      return (
                        <div
                          key={`${message.id}-text-${index}`}
                          className="flex-1 prose prose-invert prose-zinc prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-h5:text-sm prose-h6:text-xs"
                        >
                          <Markdown>{part.text}</Markdown>
                        </div>
                      );
                    }

                    if (!isToolUIPart(part)) return null;

                    const toolName = getToolName(part);

                    switch (part.state) {
                      case "input-streaming":
                      case "input-available": {
                        const text = toolLoadingText[toolName];
                        if (!text) return null;

                        return (
                          <ToolLoading key={part.toolCallId} text={text} />
                        );
                      }

                      case "output-available":
                        if (toolName === "githubProfile") {
                          return (
                            <GithubProfile
                              key={part.toolCallId}
                              user={part.output as GithubUser}
                            />
                          );
                        }
                        return null;

                      case "output-error":
                        return (
                          <span
                            key={part.toolCallId}
                            className="text-sm text-red-400"
                          >
                            Erro ao executar {toolName}: {part.errorText}
                          </span>
                        );

                      default:
                        return null;
                    }
                  })}
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        <ChatScrollToBottomButton
          containerRef={containerRef}
          scrollRef={bottomRef}
        />
      </div>

      <MessageInput
        disabled={isBusy}
        value={input}
        onValueChange={(event) => setInput(event.target.value)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
