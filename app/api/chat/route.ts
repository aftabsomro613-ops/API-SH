import { NextRequest } from "next/server";
import type { ChatCompletionMessageParam } from "openai/resources/index";
import { streamChatCompletion } from "@/lib/azure-openai";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import type { ChatRequestBody } from "@/lib/types";

export const runtime = "nodejs";

const MAX_MESSAGE_LENGTH = 8000;
const MAX_HISTORY_MESSAGES = 40;

export async function POST(req: NextRequest) {
  let body: ChatRequestBody;

  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  if (!body?.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return jsonError("Request must include a non-empty `messages` array.", 400);
  }

  const trimmedHistory = body.messages.slice(-MAX_HISTORY_MESSAGES);

  for (const message of trimmedHistory) {
    if (typeof message.content !== "string" || message.content.length === 0) {
      return jsonError("Each message must include non-empty string content.", 400);
    }
    if (message.content.length > MAX_MESSAGE_LENGTH) {
      return jsonError(
        `Message content exceeds the ${MAX_MESSAGE_LENGTH} character limit.`,
        400
      );
    }
    if (!["user", "assistant"].includes(message.role)) {
      return jsonError("Message role must be `user` or `assistant`.", 400);
    }
  }

  const conversation: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...trimmedHistory.map((m) => ({
      role: m.role,
      content: m.content,
    })) as ChatCompletionMessageParam[],
  ];

  const encoder = new TextEncoder();

  try {
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const delta of streamChatCompletion(conversation)) {
            controller.enqueue(encoder.encode(delta));
          }
          controller.close();
        } catch (err) {
          console.error("Azure OpenAI streaming error:", err);
          controller.enqueue(
            encoder.encode(
              "\n\n_⚠️ The assistant hit an error while generating this response. Please try again._"
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("Chat route error:", err);
    return jsonError(
      "The assistant is currently unavailable. Check your Azure OpenAI configuration.",
      500
    );
  }
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
