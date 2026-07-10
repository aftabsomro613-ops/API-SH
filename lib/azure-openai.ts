import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/index";

/**
 * Azure OpenAI Service (v1 API)
 * ------------------------------
 * Node/Next.js equivalent of services/azure_openai.py.
 *
 * Azure OpenAI now exposes a "v1" API surface
 * (https://YOUR-RESOURCE.openai.azure.com/openai/v1) that is fully
 * compatible with the standard OpenAI SDK — no `AzureOpenAI` class,
 * no `api-version` query param, no Azure-specific URL building. You
 * just point the normal `OpenAI` client's `baseURL` at that endpoint
 * and pass the deployment name as `model`. This is exactly what the
 * original Python app did (`OpenAI(base_url=endpoint, api_key=...)`
 * in services/azure_openai.py) — this file mirrors that.
 *
 * AZURE_OPENAI_ENDPOINT should be the full v1 URL, e.g.
 *   https://your-resource-name.openai.azure.com/openai/v1
 *
 * Auth: the original Python app authenticated with
 * `DefaultAzureCredential` (Azure AD / managed identity), which
 * relies on the machine running it being logged in via `az login` or
 * hosted on Azure infrastructure with a managed identity attached.
 * That model doesn't transfer well to a serverless Next.js deployment
 * (Vercel, etc.), so this version authenticates with a standard Azure
 * OpenAI API key instead (`AZURE_OPENAI_API_KEY`).
 *
 * If you deploy on Azure infrastructure and want Azure AD auth
 * instead of a static key, replace the `apiKey` below with a bearer
 * token provider from `@azure/identity`'s `getBearerTokenProvider`,
 * the same way the original Python service did — the v1 API accepts
 * either.
 */

let cachedClient: OpenAI | null = null;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Check your .env.local file.`
    );
  }
  return value;
}

function normalizeEndpoint(rawEndpoint: string): string {
  const trimmed = rawEndpoint.trim().replace(/\/+$/, "");
  // Be forgiving if someone pastes the bare resource URL without /openai/v1.
  if (/\/openai\/v1$/i.test(trimmed)) return trimmed;
  return `${trimmed}/openai/v1`;
}

export function getAzureOpenAIClient(): OpenAI {
  if (cachedClient) return cachedClient;

  const endpoint = normalizeEndpoint(getRequiredEnv("AZURE_OPENAI_ENDPOINT"));
  const apiKey = getRequiredEnv("AZURE_OPENAI_API_KEY");

  cachedClient = new OpenAI({
    baseURL: endpoint,
    apiKey,
  });

  return cachedClient;
}

export function getDeploymentName(): string {
  return getRequiredEnv("AZURE_OPENAI_DEPLOYMENT");
}

/**
 * Streams a chat completion from Azure OpenAI and returns an async
 * generator yielding text deltas as they arrive.
 */
export async function* streamChatCompletion(
  messages: ChatCompletionMessageParam[]
) {
  const client = getAzureOpenAIClient();
  const deployment = getDeploymentName();

  const stream = await client.chat.completions.create({
    model: deployment,
    messages,
    temperature: 1,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content;
    if (delta) {
      yield delta;
    }
  }
}
