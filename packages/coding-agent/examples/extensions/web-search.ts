/**
 * Web Search & URL Extraction via Parallel API
 *
 * Registers web_search and web_extract as LLM-callable tools with promptSnippet
 * and promptGuidelines so the model selects them for web queries on every turn.
 * Uses fetch() directly — no npm dependencies required.
 *
 * Requires: PARALLEL_API_KEY environment variable.
 * Get a key at https://platform.parallel.ai
 *
 * Usage:
 *   pi -e examples/extensions/web-search.ts
 *
 * Tools:
 *   web_search  — "What are the latest developments in quantum computing?"
 *   web_extract — "Extract the key points from https://docs.parallel.ai"
 *
 * Commands:
 *   /search <query>  — quick web search
 *   /extract <url>   — quick URL extraction
 *
 * For the production npm package with the parallel-web SDK (retries, types),
 * see: pi install npm:@parallel-web/pi
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";

const API_BASE = "https://api.parallel.ai/v1beta";

interface SearchResult {
	url: string;
	title?: string | null;
	publish_date?: string | null;
	excerpts?: string[] | null;
}

interface SearchResponse {
	search_id: string;
	results: SearchResult[];
	warnings?: Array<{ type: string; message: string }> | null;
}

interface ExtractResult {
	url: string;
	title?: string | null;
	excerpts?: string[] | null;
	full_content?: string | null;
	publish_date?: string | null;
}

interface ExtractError {
	url: string;
	error_type: string;
	http_status_code?: number | null;
	content?: string | null;
}

interface ExtractResponse {
	extract_id: string;
	results: ExtractResult[];
	errors: ExtractError[];
	warnings?: Array<{ type: string; message: string }> | null;
}

function getApiKey(): string {
	const key = process.env.PARALLEL_API_KEY;
	if (!key) {
		throw new Error("PARALLEL_API_KEY not set. Get a key at https://platform.parallel.ai");
	}
	return key;
}

async function parallelFetch<T>(path: string, body: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
	const apiKey = getApiKey();
	const response = await fetch(`${API_BASE}${path}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": apiKey,
		},
		body: JSON.stringify(body),
		signal,
	});

	if (!response.ok) {
		const text = await response.text().catch(() => "");
		throw new Error(`Parallel API error (${response.status}): ${text || response.statusText}`);
	}

	return (await response.json()) as T;
}

function formatSearchResults(data: SearchResponse): string {
	if (data.results.length === 0) {
		return "No results found.";
	}

	const lines: string[] = [];
	for (const r of data.results) {
		lines.push(`## ${r.title || r.url}`);
		lines.push(`URL: ${r.url}`);
		if (r.publish_date) lines.push(`Published: ${r.publish_date}`);
		if (r.excerpts && r.excerpts.length > 0) {
			lines.push("");
			lines.push(r.excerpts.join("\n\n"));
		}
		lines.push("");
	}

	return lines.join("\n");
}

function formatExtractResults(data: ExtractResponse): string {
	const lines: string[] = [];

	for (const r of data.results) {
		lines.push(`## ${r.title || r.url}`);
		lines.push(`URL: ${r.url}`);
		if (r.publish_date) lines.push(`Published: ${r.publish_date}`);
		if (r.full_content) {
			lines.push("");
			lines.push(r.full_content);
		} else if (r.excerpts && r.excerpts.length > 0) {
			lines.push("");
			lines.push(r.excerpts.join("\n\n"));
		}
		lines.push("");
	}

	for (const e of data.errors) {
		lines.push(`Error fetching ${e.url}: ${e.error_type} (${e.http_status_code || "unknown"})`);
	}

	return lines.join("\n") || "No content extracted.";
}

export default function webSearch(pi: ExtensionAPI) {
	// =========================================================================
	// Tool: web_search
	// =========================================================================
	pi.registerTool({
		name: "web_search",
		label: "Web Search",
		description: "Search the web for current information, documentation, facts, or news via the Parallel API",
		promptSnippet: "Search the web via Parallel API. Returns ranked results with LLM-optimized excerpts.",
		promptGuidelines: [
			"Use web_search for any web lookup, research, fact-checking, or query needing current information.",
		],
		parameters: Type.Object({
			objective: Type.String({ description: "Natural-language description of what to search for" }),
			search_queries: Type.Optional(
				Type.Array(Type.String(), { description: "Keyword search queries (1-6 words each)" }),
			),
			mode: Type.Optional(
				Type.Union([Type.Literal("agentic"), Type.Literal("one-shot"), Type.Literal("fast")], {
					description:
						"Result mode: 'agentic' (concise, default), 'one-shot' (comprehensive), 'fast' (low latency)",
				}),
			),
			max_results: Type.Optional(Type.Number({ description: "Max results to return (1-20, default: 10)" })),
			after_date: Type.Optional(Type.String({ description: "Only results after this date (YYYY-MM-DD)" })),
			include_domains: Type.Optional(
				Type.Array(Type.String(), { description: "Restrict to these domains (e.g., ['github.com'])" }),
			),
			exclude_domains: Type.Optional(Type.Array(Type.String(), { description: "Exclude these domains" })),
		}),
		async execute(_toolCallId, params, signal) {
			const body: Record<string, unknown> = {
				objective: params.objective,
				mode: params.mode ?? "agentic",
			};
			if (params.search_queries) body.search_queries = params.search_queries;
			if (params.max_results) body.max_results = params.max_results;

			const sourcePolicy: Record<string, unknown> = {};
			if (params.after_date) sourcePolicy.after_date = params.after_date;
			if (params.include_domains) sourcePolicy.include_domains = params.include_domains;
			if (params.exclude_domains) sourcePolicy.exclude_domains = params.exclude_domains;
			if (Object.keys(sourcePolicy).length > 0) body.source_policy = sourcePolicy;

			const data = await parallelFetch<SearchResponse>("/search", body, signal);

			return {
				content: [{ type: "text", text: formatSearchResults(data) }],
				details: { search_id: data.search_id, resultCount: data.results.length },
			};
		},
	});

	// =========================================================================
	// Tool: web_extract
	// =========================================================================
	pi.registerTool({
		name: "web_extract",
		label: "Web Extract",
		description: "Extract clean content from URLs — handles JS-rendered pages, PDFs, and paywalled sites",
		promptSnippet:
			"Extract clean content from URLs via Parallel. Handles JS-rendered pages and PDFs. Returns LLM-ready markdown.",
		promptGuidelines: ["Use web_extract to read content from a specific URL, article, or PDF."],
		parameters: Type.Object({
			urls: Type.Array(Type.String(), { description: "URLs to extract content from (max 10)" }),
			objective: Type.Optional(Type.String({ description: "Focus extraction on specific content" })),
			full_content: Type.Optional(
				Type.Boolean({ description: "Return complete page content (default: false, returns excerpts)" }),
			),
		}),
		async execute(_toolCallId, params, signal) {
			const body: Record<string, unknown> = {
				urls: params.urls,
				excerpts: true,
			};
			if (params.objective) body.objective = params.objective;
			if (params.full_content) body.full_content = true;

			const data = await parallelFetch<ExtractResponse>("/extract", body, signal);

			return {
				content: [{ type: "text", text: formatExtractResults(data) }],
				details: {
					extract_id: data.extract_id,
					resultCount: data.results.length,
					errorCount: data.errors.length,
				},
			};
		},
	});

	// =========================================================================
	// Slash commands
	// =========================================================================
	pi.registerCommand("search", {
		description: "Search the web via Parallel",
		handler: async (args, ctx) => {
			if (!args.trim()) {
				ctx.ui.notify("Usage: /search <query>", "warning");
				return;
			}
			if (!ctx.isIdle()) {
				ctx.ui.notify("Agent is busy", "warning");
				return;
			}
			pi.sendUserMessage(`Search the web for: ${args}`);
		},
	});

	pi.registerCommand("extract", {
		description: "Extract content from a URL via Parallel",
		handler: async (args, ctx) => {
			if (!args.trim()) {
				ctx.ui.notify("Usage: /extract <url>", "warning");
				return;
			}
			if (!ctx.isIdle()) {
				ctx.ui.notify("Agent is busy", "warning");
				return;
			}
			pi.sendUserMessage(`Extract the content from: ${args}`);
		},
	});

	// =========================================================================
	// Setup check
	// =========================================================================
	pi.on("session_start", async (_event, ctx) => {
		if (!process.env.PARALLEL_API_KEY) {
			ctx.ui.notify("PARALLEL_API_KEY not set. Get a key at https://platform.parallel.ai", "warning");
		}
	});
}
