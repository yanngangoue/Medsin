const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

type MessagesResponse = {
  content?: Array<{ type: string; text?: string }>;
};

export type GenerateTextOptions = {
  /** Surcharge ponctuelle du plafond de tokens de sortie (sinon env / défaut). */
  maxTokens?: number;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

/**
 * Appelle l’API Messages Anthropic (Claude), côté serveur uniquement.
 * N’exposez jamais `ANTHROPIC_API_KEY` au client.
 */
export async function generateText(
  prompt: string,
  options?: GenerateTextOptions,
): Promise<string> {
  const trimmed = prompt.trim();
  if (!trimmed) {
    throw new Error("prompt must be a non-empty string");
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey?.trim()) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const model =
    process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-5";
  const maxTokensRaw = process.env.ANTHROPIC_MAX_TOKENS;
  const envMax = maxTokensRaw ? Number(maxTokensRaw) : 4096;
  const fromEnv =
    Number.isFinite(envMax) && envMax > 0 ? Math.min(envMax, 8192) : 4096;
  const override = options?.maxTokens;
  const max_tokens =
    override != null && Number.isFinite(override) && override > 0
      ? Math.min(Math.floor(override), 8192)
      : fromEnv;

  const res = await fetch(ANTHROPIC_MESSAGES_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model,
      max_tokens,
      messages: [{ role: "user", content: trimmed }],
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Anthropic API ${res.status}: ${raw}`);
  }

  let data: MessagesResponse;
  try {
    data = JSON.parse(raw) as MessagesResponse;
  } catch {
    throw new Error("Anthropic API returned invalid JSON");
  }

  const block = data.content?.find((c) => c.type === "text");
  const text = block?.text;
  if (typeof text !== "string" || !text.length) {
    throw new Error("Anthropic response contained no text content");
  }

  return text;
}

/** Conversation multi-tours (coach IA, etc.). */
export async function generateChatReply(
  system: string,
  messages: ChatMessage[],
  options?: GenerateTextOptions,
): Promise<string> {
  if (!messages.length) {
    throw new Error("messages must be non-empty");
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey?.trim()) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const model =
    process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-5";
  const maxTokensRaw = process.env.ANTHROPIC_MAX_TOKENS;
  const envMax = maxTokensRaw ? Number(maxTokensRaw) : 4096;
  const fromEnv =
    Number.isFinite(envMax) && envMax > 0 ? Math.min(envMax, 8192) : 4096;
  const override = options?.maxTokens;
  const max_tokens =
    override != null && Number.isFinite(override) && override > 0
      ? Math.min(Math.floor(override), 8192)
      : fromEnv;

  const res = await fetch(ANTHROPIC_MESSAGES_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model,
      max_tokens,
      system: system.trim(),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Anthropic API ${res.status}: ${raw}`);
  }

  let data: MessagesResponse;
  try {
    data = JSON.parse(raw) as MessagesResponse;
  } catch {
    throw new Error("Anthropic API returned invalid JSON");
  }

  const block = data.content?.find((c) => c.type === "text");
  const text = block?.text;
  if (typeof text !== "string" || !text.length) {
    throw new Error("Anthropic response contained no text content");
  }

  return text;
}
