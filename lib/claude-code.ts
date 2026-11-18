import { createClaudeCode } from "ai-sdk-provider-claude-code";

export const claudeCode = createClaudeCode({
  defaultSettings: {
    allowedTools: ["Read", "Write", "Edit", "WebSearch", "WebFetch"],
    permissionMode: "default",
  },
});
