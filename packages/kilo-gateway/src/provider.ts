import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createOpenAI } from "@ai-sdk/openai"
import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import type { Provider as SDK } from "ai"
import type { KiloProviderOptions } from "./types.js"
import { getKiloUrlFromToken, getApiKey } from "./auth/token.js"
import { buildKiloHeaders, DEFAULT_HEADERS } from "./headers.js"
import { KILO_API_BASE, ANONYMOUS_API_KEY } from "./api/constants.js"

export type AiSdkProvider = "anthropic" | "openai" | "openai-compatible" | "openrouter"

function buildUrl(base: string, path: string): string {
  const prefix = base.endsWith("/") ? base : `${base}/`
  return `${prefix}${path}/`
}

function providerPath(base: string, sdkProvider: AiSdkProvider): string {
  if (base.includes("/openrouter") && sdkProvider === "openrouter") return base
  if (base.includes(`/${sdkProvider}`)) return base
  return buildUrl(base, sdkProvider)
}

function makeHeaders(options: KiloProviderOptions) {
  return {
    ...DEFAULT_HEADERS,
    ...buildKiloHeaders(undefined, {
      kilocodeOrganizationId: options.kilocodeOrganizationId,
      kilocodeTesterWarningsDisabledUntil: undefined,
    }),
    ...options.headers,
  }
}

function makeWrappedFetch(apiKey: string | undefined, headers: Record<string, string>, options: KiloProviderOptions) {
  const original = options.fetch ?? fetch
  return async (input: string | URL | Request, init?: RequestInit) => {
    const h = new Headers(init?.headers)
    Object.entries(headers).forEach(([k, v]) => h.set(k, v))
    if (apiKey) h.set("Authorization", `Bearer ${apiKey}`)
    return original(input, { ...init, headers: h })
  }
}

/**
 * Create a KiloCode provider instance using the specified Vercel AI SDK provider.
 *
 * Supported providers:
 * - "openrouter" (default): uses @openrouter/ai-sdk-provider
 * - "anthropic": uses @ai-sdk/anthropic
 * - "openai": uses @ai-sdk/openai
 * - "openai-compatible": uses @ai-sdk/openai-compatible
 */
export function createKiloForProvider(sdkProvider: AiSdkProvider, options: KiloProviderOptions = {}): SDK {
  const apiKey = getApiKey(options)
  const base = getKiloUrlFromToken(options.baseURL ?? KILO_API_BASE, apiKey ?? "")
  const headers = makeHeaders(options)
  const wrapped = makeWrappedFetch(apiKey, headers, options)
  const key = apiKey ?? ANONYMOUS_API_KEY

  if (sdkProvider === "anthropic") {
    return createAnthropic({
      baseURL: providerPath(base, "anthropic"),
      apiKey: key,
      headers,
      fetch: wrapped as typeof fetch,
    }) as unknown as SDK
  }

  if (sdkProvider === "openai") {
    return createOpenAI({
      baseURL: providerPath(base, "openai"),
      apiKey: key,
      headers,
      fetch: wrapped as typeof fetch,
    }) as unknown as SDK
  }

  if (sdkProvider === "openai-compatible") {
    return createOpenAICompatible({
      name: "kilo",
      baseURL: providerPath(base, "openai-compatible"),
      apiKey: key,
      headers,
      fetch: wrapped as typeof fetch,
    }) as unknown as SDK
  }

  // Default: openrouter
  const openRouterUrl = base.includes("/openrouter")
    ? base
    : base.endsWith("/")
      ? `${base}openrouter/`
      : `${base}/openrouter/`

  return createOpenRouter({
    baseURL: openRouterUrl,
    apiKey: key,
    headers,
    fetch: wrapped as typeof fetch,
  })
}

/**
 * Create a KiloCode provider instance
 *
 * This provider wraps the OpenRouter SDK with KiloCode-specific configuration
 * including custom authentication, headers, and base URL.
 *
 * @example
 * ```typescript
 * const provider = createKilo({
 *   kilocodeToken: "your-token-here",
 *   kilocodeOrganizationId: "org-123"
 * })
 *
 * const model = provider.languageModel("anthropic/claude-sonnet-4")
 * ```
 */
export function createKilo(options: KiloProviderOptions = {}): SDK {
  return createKiloForProvider("openrouter", options)
}
