// src/features/chatbot/lib/completion.ts
/**
 * Sends one chat turn to an OpenAI-compatible endpoint and streams the reply when enabled.
 * expo/fetch is used because it exposes the response body as a stream on the device.
 */
import { fetch as expoFetch } from "expo/fetch";
import {
  buildRequestBody,
  completionsEndpoint,
  describeHttpError,
  parseStreamLine,
  readCompletionText,
  type RequestMessage,
  type SamplingParams,
} from "./request";

export interface ChatConnection {
  baseUrl: string;
  apiKey: string;
  model: string;
}

interface RequestReplyInput {
  connection: ChatConnection;
  messages: RequestMessage[];
  params: SamplingParams;
  stream: boolean;
  signal: AbortSignal;
  onDelta: (text: string) => void;
}

export async function requestReply({ connection, messages, params, stream, signal, onDelta }: RequestReplyInput): Promise<string> {
  const endpoint = completionsEndpoint(connection.baseUrl);
  const response = await expoFetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${connection.apiKey}`,
      "Content-Type": "application/json",
      Accept: stream ? "text/event-stream" : "application/json",
    },
    body: buildRequestBody(connection.model, messages, params, stream),
    signal,
  });

  if (!response.ok) {
    throw new Error(describeHttpError(response.status, hostOf(endpoint), await response.text()));
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!stream || !response.body || !contentType.includes("event-stream")) {
    return readCompletionText(await response.text());
  }
  return readStream(response.body, onDelta);
}

async function readStream(body: ReadableStream<Uint8Array>, onDelta: (text: string) => void): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let reply = "";
  let finished = false;

  const consume = (line: string) => {
    const event = parseStreamLine(line);
    if (!event) return;
    if (event.type === "done") {
      finished = true;
      return;
    }
    reply += event.text;
    onDelta(event.text);
  };

  while (!finished) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    lines.forEach(consume);
  }

  if (!finished) {
    buffer += decoder.decode();
    buffer.split("\n").forEach(consume);
  }
  await reader.cancel().catch(() => undefined);

  if (!reply.trim()) {
    throw new Error("The model returned an empty reply.");
  }
  return reply;
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
