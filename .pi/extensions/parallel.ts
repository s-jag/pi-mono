/**
 * Parallel Web Tools Extension
 *
 * Registers parallel_search, parallel_extract, parallel_research, and
 * parallel_enrich as first-class LLM-callable tools, plus short slash
 * commands (/search, /extract, /research, /enrich).
 *
 * Also intercepts bash tool calls containing curl/wget for web content
 * and suggests using the Parallel tools instead.
 *
 * Requires: parallel-cli installed and PARALLEL_API_KEY set.
 * Install: curl -fsSL https://parallel.ai/install.sh | bash
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";

interface SearchResult {
	url?: string;
	title?: string;
	excerpts?: string[];
	publish_date?: string;
}

interface SearchResponse {
	search_id?: string;
	results?: SearchResult[];
}

function formatSearchResults(raw: string): string {
	try {
		const data: SearchResponse = JSON.parse(raw);
		if (!data.results || data.results.length === 0) {
			return "No results found.";
		}
		const lines: string[] = [`Found ${data.results.length} result(s):\n`];
		for (let i = 0; i < data.results.length; i++) {
			const r = data.results[i];
			const title = r.title || "(untitled)";
			const url = r.url || "";
			const date = r.publish_date ? ` (${r.publish_date})` : "";
			lines.push(`${i + 1}. ${title}${date}`);
			if (url) lines.push(`   ${url}`);
			if (r.excerpts && r.excerpts.length > 0) {
				const excerpt = r.excerpts[0];
				const trimmed = excerpt.length > 300 ? excerpt.slice(0, 300) + "..." : excerpt;
				lines.push(`   ${trimmed}`);
			}
			lines.push("");
		}
		return lines.join("\n");
	} catch {
		return raw;
	}
}

export default function parallelExtension(pi: ExtensionAPI) {
	// =========================================================================
	// Tool: parallel_search
	// =========================================================================
	pi.registerTool({
		name: "parallel_search",
		label: "Parallel Search",
		description: "Search the web for current information, documentation, facts, or news via the Parallel API",
		promptSnippet:
			"Search the web via Parallel API. Returns ranked results with LLM-optimized excerpts. Supports keyword filters, domain scoping, and date filtering.",
		promptGuidelines: [
			"Use parallel_search for any web lookup, research, fact-checking, or query needing current information.",
			"Provide a clear objective and add keyword queries for precision. Use after_date for time-sensitive queries.",
		],
		parameters: Type.Object({
			objective: Type.String({ description: "Natural language description of what to search for" }),
			queries: Type.Optional(
				Type.Array(Type.String(), { description: "Keyword queries to supplement the objective (3-8 recommended)" }),
			),
			max_results: Type.Optional(Type.Number({ description: "Number of results, 1-20 (default: 10)" })),
			after_date: Type.Optional(Type.String({ description: "Only results after this date (YYYY-MM-DD)" })),
			include_domains: Type.Optional(
				Type.Array(Type.String(), { description: "Restrict to these domains (max 10)" }),
			),
			exclude_domains: Type.Optional(Type.Array(Type.String(), { description: "Exclude these domains (max 10)" })),
		}),
		async execute(_toolCallId, params, signal, _onUpdate, ctx) {
			const args = ["search", params.objective, "--json"];
			if (params.queries) {
				for (const q of params.queries) args.push("-q", q);
			}
			if (params.max_results) args.push("--max-results", String(params.max_results));
			if (params.after_date) args.push("--after-date", params.after_date);
			if (params.include_domains) {
				for (const d of params.include_domains) args.push("--include-domains", d);
			}
			if (params.exclude_domains) {
				for (const d of params.exclude_domains) args.push("--exclude-domains", d);
			}

			const result = await ctx.exec("parallel-cli", args, { signal, timeout: 60_000 });

			if (result.code !== 0) {
				return {
					content: [{ type: "text", text: result.stderr || `parallel-cli exited with code ${result.code}` }],
					details: { exitCode: result.code },
				};
			}

			return {
				content: [{ type: "text", text: formatSearchResults(result.stdout) }],
				details: { exitCode: result.code, rawJson: result.stdout },
			};
		},
	});

	// =========================================================================
	// Tool: parallel_extract
	// =========================================================================
	pi.registerTool({
		name: "parallel_extract",
		label: "Parallel Extract",
		description: "Extract clean markdown content from URLs — handles webpages, articles, PDFs, and JS-heavy sites",
		promptSnippet:
			"Extract clean content from URLs via Parallel API. Returns LLM-ready markdown from webpages, PDFs, and JS-rendered pages.",
		promptGuidelines: [
			"Use parallel_extract when you need to read content from a specific URL, article, or PDF.",
			"Provide an objective to focus extraction on the most relevant content.",
		],
		parameters: Type.Object({
			urls: Type.Array(Type.String(), { description: "URLs to extract content from (max 10)" }),
			objective: Type.Optional(Type.String({ description: "Focus extraction on specific content" })),
			full_content: Type.Optional(
				Type.Boolean({ description: "Include complete page content (default: false, returns excerpts)" }),
			),
		}),
		async execute(_toolCallId, params, signal, _onUpdate, ctx) {
			const args = ["extract"];
			for (const url of params.urls) args.push("--url", url);
			args.push("--json");
			if (params.objective) args.push("--objective", params.objective);
			if (params.full_content) args.push("--full-content");

			const result = await ctx.exec("parallel-cli", args, { signal, timeout: 60_000 });

			if (result.code !== 0) {
				return {
					content: [{ type: "text", text: result.stderr || `parallel-cli exited with code ${result.code}` }],
					details: { exitCode: result.code },
				};
			}

			return {
				content: [{ type: "text", text: result.stdout }],
				details: { exitCode: result.code },
			};
		},
	});

	// =========================================================================
	// Tool: parallel_research
	// =========================================================================
	pi.registerTool({
		name: "parallel_research",
		label: "Parallel Research",
		description:
			"Run deep multi-source research on a complex topic. Returns a comprehensive report with citations. Use for thorough investigation, competitive analysis, or due diligence.",
		promptSnippet:
			"Deep multi-source research via Parallel API. Returns comprehensive reports with citations. For thorough research, competitive analysis, and investigation.",
		promptGuidelines: [
			"Use parallel_research only when the user explicitly asks for deep research, comprehensive analysis, or thorough investigation of a topic.",
			"For quick lookups or simple questions, use parallel_search instead. parallel_research is slower but much more thorough.",
		],
		parameters: Type.Object({
			question: Type.String({
				description: "The research question or topic (2-5 sentences with scope, constraints, and desired output)",
			}),
			processor: Type.Optional(
				Type.String({
					description:
						"Processing tier: lite-fast (quick), base-fast, core-fast, pro-fast (default), ultra-fast (deep), ultra2x-fast, ultra4x-fast, ultra8x-fast (most thorough)",
				}),
			),
			output_path: Type.Optional(
				Type.String({ description: "Path to save the report (default: /tmp/parallel-research-output)" }),
			),
		}),
		async execute(_toolCallId, params, signal, _onUpdate, ctx) {
			const outputPath = params.output_path || "/tmp/parallel-research-output";
			const processor = params.processor || "pro-fast";
			const args = ["research", "run", params.question, "--processor", processor, "--json", "-o", outputPath];

			const timeout = processor.startsWith("ultra") ? 600_000 : 300_000;
			const result = await ctx.exec("parallel-cli", args, { signal, timeout });

			if (result.code !== 0) {
				return {
					content: [{ type: "text", text: result.stderr || `parallel-cli research exited with code ${result.code}` }],
					details: { exitCode: result.code },
				};
			}

			let summary = result.stdout;
			try {
				const data = JSON.parse(result.stdout);
				const parts: string[] = [];
				if (data.result?.summary) {
					parts.push("## Summary\n" + data.result.summary);
				}
				if (data.result?.findings && Array.isArray(data.result.findings)) {
					parts.push("\n## Key Findings");
					for (const f of data.result.findings) {
						parts.push(`- ${typeof f === "string" ? f : JSON.stringify(f)}`);
					}
				}
				if (data.result?.sources && Array.isArray(data.result.sources)) {
					parts.push("\n## Sources");
					for (const s of data.result.sources) {
						const title = s.title || s.url || "(unknown)";
						const url = s.url || "";
						parts.push(`- [${title}](${url})`);
					}
				}
				if (parts.length > 0) {
					parts.push(`\nFull report saved to: ${outputPath}`);
					summary = parts.join("\n");
				}
			} catch {
				// raw output is fine
			}

			return {
				content: [{ type: "text", text: summary }],
				details: { exitCode: result.code, outputPath },
			};
		},
	});

	// =========================================================================
	// Tool: parallel_enrich
	// =========================================================================
	pi.registerTool({
		name: "parallel_enrich",
		label: "Parallel Enrich",
		description:
			"Enrich a list of entities (companies, people, products) with web-sourced data like CEO names, funding, employee counts, or contact info",
		promptSnippet:
			"Bulk data enrichment via Parallel API. Adds web-sourced fields to lists of companies, people, or products.",
		promptGuidelines: [
			"Use parallel_enrich when the user wants to add web-sourced information to a list of entities.",
			"Provide the data as inline JSON and describe the desired enrichment fields via intent.",
		],
		parameters: Type.Object({
			data: Type.String({
				description:
					'JSON array of records to enrich, e.g. [{"company": "Google"}, {"company": "Microsoft"}]',
			}),
			intent: Type.String({
				description: "Natural language description of what fields to add, e.g. 'CEO name and founding year'",
			}),
			output_path: Type.String({
				description: "Path to save the enriched CSV output",
			}),
			processor: Type.Optional(
				Type.String({ description: "Processing tier: lite-fast, base-fast, core-fast, pro-fast (default)" }),
			),
		}),
		async execute(_toolCallId, params, signal, _onUpdate, ctx) {
			const args = [
				"enrich",
				"run",
				"--data",
				params.data,
				"--intent",
				params.intent,
				"--target",
				params.output_path,
			];
			if (params.processor) args.push("--processor", params.processor);

			const result = await ctx.exec("parallel-cli", args, { signal, timeout: 300_000 });

			if (result.code !== 0) {
				return {
					content: [{ type: "text", text: result.stderr || `parallel-cli enrich exited with code ${result.code}` }],
					details: { exitCode: result.code },
				};
			}

			return {
				content: [
					{
						type: "text",
						text: `Enrichment complete. Results saved to: ${params.output_path}\n\n${result.stdout}`,
					},
				],
				details: { exitCode: result.code, outputPath: params.output_path },
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
			pi.sendUserMessage(`Extract the content from this URL: ${args}`);
		},
	});

	pi.registerCommand("research", {
		description: "Run deep research via Parallel",
		handler: async (args, ctx) => {
			if (!args.trim()) {
				ctx.ui.notify("Usage: /research <topic>", "warning");
				return;
			}
			if (!ctx.isIdle()) {
				ctx.ui.notify("Agent is busy", "warning");
				return;
			}
			pi.sendUserMessage(`Run deep research on this topic: ${args}`);
		},
	});

	pi.registerCommand("enrich", {
		description: "Enrich data with web-sourced fields via Parallel",
		handler: async (args, ctx) => {
			if (!args.trim()) {
				ctx.ui.notify("Usage: /enrich <description of data and fields>", "warning");
				return;
			}
			if (!ctx.isIdle()) {
				ctx.ui.notify("Agent is busy", "warning");
				return;
			}
			pi.sendUserMessage(`Enrich data using parallel_enrich. Details: ${args}`);
		},
	});

	// =========================================================================
	// Curl/wget interception: suggest Parallel tools when model uses bash
	// =========================================================================
	const CURL_WGET_PATTERN = /\b(curl|wget)\b.*\bhttps?:\/\//i;

	pi.on("tool_call", async (event, ctx) => {
		if (event.toolName !== "bash") return;
		const command = event.args?.command;
		if (typeof command !== "string") return;
		if (!CURL_WGET_PATTERN.test(command)) return;

		ctx.ui.notify(
			"Tip: use parallel_search or parallel_extract instead of curl/wget for better web results",
			"info",
		);
	});

	// =========================================================================
	// Setup checks on session start
	// =========================================================================
	pi.on("session_start", async (_event, ctx) => {
		const cliCheck = await ctx.exec("which", ["parallel-cli"], { timeout: 5_000 });
		if (cliCheck.code !== 0) {
			ctx.ui.notify(
				"parallel-cli not found. Install: curl -fsSL https://parallel.ai/install.sh | bash",
				"warning",
			);
			return;
		}

		const keyCheck = await ctx.exec("parallel-cli", ["search", "--help"], { timeout: 5_000 });
		if (keyCheck.stderr && keyCheck.stderr.includes("PARALLEL_API_KEY")) {
			ctx.ui.notify("PARALLEL_API_KEY not set. Get one at https://parallel.ai", "warning");
		}
	});
}
