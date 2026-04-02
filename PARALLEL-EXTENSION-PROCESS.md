# Parallel Extension v2: Research Process and Implementation

## Objective

Upgrade the Parallel web tools extension for the pi coding agent from a basic two-tool setup (search + extract) to a full-featured integration covering all four Parallel API products, with smarter output formatting, developer experience improvements, and proactive guidance.

---

## Phase 1: Landscape Research

### Pi-Mono Current State

We began by surveying the pi-mono project's recent activity and public presence.

**Project metrics (early April 2026):**
- 29.9K GitHub stars, 3.2K forks, 160+ contributors
- 1.6M+ weekly npm downloads
- 183 releases, latest v0.64.0 (March 29, 2026)
- Currently in OSS Weekend (issue tracker closed through April 6-13)

Sources:
- [GitHub - badlogic/pi-mono](https://github.com/badlogic/pi-mono)
- [npm - @mariozechner/pi-coding-agent](https://www.npmjs.com/package/@mariozechner/pi-coding-agent)

**Recent releases (v0.60-v0.64) introduced:**
- `prepareArguments` hook on tool definitions for argument normalization (v0.64)
- Multi-edit support in `edit` tool (v0.63)
- `getApiKeyAndHeaders()` replacing `getApiKey()` for dynamic auth (v0.63)
- Namespaced keybinding system (v0.61)
- JSONL session export/import (v0.61)
- `createLocalBashOperations()` for extensions (v0.60)
- Session forking via `--fork` (v0.60)

Sources:
- [v0.64.0 Release Notes](https://github.com/badlogic/pi-mono/releases/tag/v0.64.0)
- [Coding Agent CHANGELOG](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/CHANGELOG.md)

### Key Publicity and Coverage

**Mario Zechner's blog post (March 25, 2026):**
"Thoughts on slowing the fuck down" -- a critique of autonomous agent swarms degrading software quality. Advocates for human-in-the-loop discipline, aligning with pi's minimal 4-tool philosophy. This post went viral in developer circles.

Source: [mariozechner.at](https://mariozechner.at/posts/2026-03-25-thoughts-on-slowing-the-fuck-down)

**Armin Ronacher's blog post (January 31, 2026):**
"Pi: The Minimal Agent Within OpenClaw" -- the Flask creator explaining why he uses pi almost exclusively. Highlights pi's "malleable like clay" philosophy and how OpenClaw embeds pi as its core engine.

Source: [lucumr.pocoo.org](https://lucumr.pocoo.org/2026/1/31/pi/)

**Third-party coverage:**
- "Goodbye Claude Code. Why pi Is My New Coding Agent Pick" by Daniel Koller
- disler/pi-vs-claude-code repo (588+ stars) comparing pi's 4-tool approach vs Claude Code's 20+ tools
- Tembo's "The 2026 Guide to Coding CLI Tools: 15 AI Agents Compared"
- Syntax.fm Podcast Episode #976 with Armin Ronacher and Mario Zechner
- Multiple YouTube reviews and demo videos

Sources:
- [danielkoller.me](https://www.danielkoller.me/en/blog/why-pi-is-my-new-coding-agent-of-choice)
- [disler/pi-vs-claude-code](https://github.com/disler/pi-vs-claude-code)
- [Tembo comparison](https://www.tembo.io/blog/coding-cli-tools-comparison)
- [Syntax.fm Episode 976](https://syntax.fm/show/976/pi-the-ai-harness-that-powers-openclaw-w-armin-ronacher-and-mario-zechner/transcript)

---

## Phase 2: Competitor Analysis

We researched what tools competitors ship built-in to identify gaps.

### Competitor Web Search Capabilities

| Agent | Built-in Web Search | Built-in URL Fetch | MCP Support |
|-------|:---:|:---:|:---:|
| Claude Code | WebSearch + WebFetch | Yes | Yes |
| Codex CLI | Cached + live search | Yes | Yes |
| Gemini CLI | google_web_search + web_fetch | Yes | Yes |
| Pi | Extension only | Extension only | Extension only |
| OpenCode | Plugin | Plugin | Yes |

**Key finding:** All four lab-native competitors (Claude Code, Codex, Gemini CLI, Copilot CLI) ship web search as a built-in tool. Pi is the only major terminal agent that requires an extension for web access. This is a deliberate philosophical choice (minimal core), but it creates friction.

Sources:
- [Claude Code Web Search Tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool)
- [Codex CLI Features](https://developers.openai.com/codex/cli/features/)
- [Gemini CLI Web Search](https://geminicli.com/docs/tools/web-search/)
- [Tembo comparison](https://www.tembo.io/blog/coding-cli-tools-comparison)

### OpenClaw Connection

OpenClaw (formerly ClawdBot/MoltBot, 160K+ stars) embeds pi as a dynamic library via `createAgentSession()`. This validates pi's SDK as production-ready for embedding. The architecture uses pi for all reasoning/execution while OpenClaw handles infrastructure (channel adapters, security boundaries, memory layers).

Sources:
- [Deep Dive into OpenClaw Architecture](https://medium.com/@dingzhanjun/deep-dive-into-openclaw-architecture-code-ecosystem-e6180f34bd07)
- [Reference Architecture: OpenClaw](https://robotpaper.ai/reference-architecture-openclaw-early-feb-2026-edition-opus-4-6/)
- [Raspberry Pi + OpenClaw](https://www.raspberrypi.com/news/turn-your-raspberry-pi-into-an-ai-agent-with-openclaw/)

### Community Extensions Ecosystem

Notable community extensions we studied:
- **Armin Ronacher's stack** (mitsuhiko/agent-stuff): 18 extensions, 19 skills including `/web-browser` via Chrome CDP
- **nicobailon/pi-subagents**: Chain/parallel/async orchestration with artifact management
- **tomsej/pi-ext**: Leader key, session switcher, powerline footer, web access
- **Multiple web search extensions**: pi-linkup, pi-codex-search, @ollama/pi-web-search, @yofriadi/pi-web-search, pi-parallel-web-search

Sources:
- [mitsuhiko/agent-stuff](https://github.com/mitsuhiko/agent-stuff)
- [nicobailon/pi-subagents](https://github.com/nicobailon/pi-subagents)
- [tomsej/pi-ext](https://github.com/tomsej/pi-ext)
- [pi package gallery](https://shittycodingagent.ai/packages)

---

## Phase 3: Parallel API Research

We researched Parallel's full product suite to determine which capabilities to expose as tools vs skills.

**Parallel products:**
- **Search API** -- ranked URLs with token-efficient excerpts
- **Extract API** -- URLs to clean markdown (JS-heavy sites, PDFs)
- **Task/Research API** -- multi-step deep research with citations and confidence scores
- **FindAll API** -- entity discovery and enrichment
- **Chat API** -- OpenAI-compatible streaming with web grounding
- **Monitor API** -- continuous web change tracking

**Parallel vs competitors:**
- Parallel: Enterprise deep research, multi-hop reasoning, SOC-2 Type II, higher latency
- Exa: Semantic/neural search, specialized indexes
- Tavily: RAG-native, plug-and-play agent default
- Firecrawl: Search + full-page scraping in one call
- Brave: Privacy-first, independent index

Sources:
- [Parallel.ai](https://parallel.ai/)
- [Parallel CLI docs](https://docs.parallel.ai/integrations/cli)
- [Parallel Search API](https://parallel.ai/blog/parallel-search-api)
- [Search APIs for AI Agents comparison](https://medium.com/@unicodeveloper/search-apis-for-ai-agents-we-tested-5-domains-heres-the-gap-2a03e09f9868)

---

## Phase 4: Experiment Data Review

We reviewed the existing experiment framework in `experiments/` which ran 1,140+ API calls across Sonnet, GPT-4o, and GPT-5 to validate tool placement strategy.

**Key findings from experiments:**
1. Tool registration is the only move that matters: baseline to tool = +74% (Sonnet), +97% (GPT-4o), +83% (GPT-5)
2. Skill-only placement is unreliable for GPT-4o (70%) but fine for Sonnet (93%) and GPT-5 (87%)
3. Surface stacking has negligible marginal value (snippet alone = 87-100%)
4. Keyword-stuffed skill descriptions backfire on GPT-4o (33%) vs specific descriptions (60%)
5. "Prefer X over curl" guidelines have no statistically significant effect

**Implication for this work:** Register research and enrich as first-class tools (not just slash commands), and use a non-blocking notification for curl interception rather than a blocking guideline.

Source: `experiments/report/findings.md` (local), `experiments/report/results.md` (local)

---

## Phase 5: Extension API Analysis

We studied pi's `ToolDefinition` interface and rendering system to understand capabilities:

```typescript
interface ToolDefinition<TParams, TDetails, TState> {
  name: string;
  label: string;
  description: string;
  promptSnippet?: string;        // Injected into "Available tools" section
  promptGuidelines?: string[];   // Injected into "Guidelines" section
  parameters: TParams;           // TypeBox schema
  execute(...): Promise<AgentToolResult<TDetails>>;
  renderCall?: (...) => Component;   // Custom TUI rendering
  renderResult?: (...) => Component; // Custom TUI rendering
}
```

Key extension events used: `tool_call` (for curl/wget interception), `session_start` (for setup checks).

Source: `packages/coding-agent/src/core/extensions/types.ts`

---

## Phase 6: Implementation

### Changes Made

**Branch:** `feat/parallel-v2`

**File:** `.pi/extensions/parallel.ts`

1. **`parallel_research` tool (new):** First-class async tool with adaptive timeouts (5min standard, 10min ultra tiers). Parses JSON response into structured summary with findings, sources, and citations. Saves full report to disk.

2. **`parallel_enrich` tool (new):** First-class tool for bulk data enrichment. Accepts inline JSON data, natural language intent, output path, and processor tier.

3. **Smart search result formatting:** `parallel_search` now parses JSON and returns numbered summaries (title, URL, date, trimmed excerpt) instead of raw JSON. Falls back gracefully on parse errors.

4. **Curl/wget interception:** `tool_call` event listener detects `curl`/`wget` with HTTP URLs in bash commands and shows a non-blocking info notification suggesting Parallel tools. Does not block the call (experiments showed guidelines don't override explicit user intent).

5. **PARALLEL_API_KEY validation:** `session_start` handler checks for both CLI installation and API key presence, with targeted notifications for each.

6. **Upgraded slash commands:** `/research` and `/enrich` now route through the registered tools instead of sending raw bash command templates as user messages.

---

## Decision Log

| Decision | Rationale |
|----------|-----------|
| Register research/enrich as tools, not just skills | Experiment data: tool registration = 90-100% selection rate vs 60-70% for skills on GPT-4o |
| Non-blocking curl notification vs blocking guideline | Experiment 3: "prefer over curl" guidelines showed +13% (NS) on Sonnet, +7% (NS) on GPT-4o |
| Parse search JSON into summaries | Reduces token consumption in LLM context, easier for model to reference specific results |
| Adaptive timeout for research | Ultra tiers can take 1-60 minutes per Parallel docs |
| No `before_agent_start` injection | Experiment 6: additional system prompt sections showed 0% marginal improvement |
| Keep skills as fallback docs | Skills serve as detailed CLI reference for advanced flags (processor tiers, async workflows) |
