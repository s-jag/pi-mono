# Web Research Compilation: Pi-Mono and Parallel Extension

All web sources fetched and search results gathered during the research phase for the Parallel Extension v2 implementation. Compiled April 2, 2026.

---

## Table of Contents

1. [Armin Ronacher: Pi - The Minimal Agent Within OpenClaw](#1-armin-ronacher-pi---the-minimal-agent-within-openclaw)
2. [Mario Zechner: Thoughts on Slowing the Fuck Down](#2-mario-zechner-thoughts-on-slowing-the-fuck-down)
3. [Tembo: 2026 Guide to Coding CLI Tools - 15 Agents Compared](#3-tembo-2026-guide-to-coding-cli-tools---15-agents-compared)
4. [Competitor Tool Capabilities](#4-competitor-tool-capabilities)
5. [OpenClaw Architecture](#5-openclaw-architecture)
6. [Community Extensions Ecosystem](#6-community-extensions-ecosystem)
7. [Parallel AI Products and API](#7-parallel-ai-products-and-api)
8. [Web Search API Comparison](#8-web-search-api-comparison)
9. [Pi-Mono GitHub Issues and Feature Requests](#9-pi-mono-github-issues-and-feature-requests)
10. [Reddit and Community Discussions](#10-reddit-and-community-discussions)
11. [SWE-Bench and Benchmark Data](#11-swe-bench-and-benchmark-data)
12. [Pi Operating Modes and Extension API](#12-pi-operating-modes-and-extension-api)
13. [Mario Zechner Background](#13-mario-zechner-background)

---

## 1. Armin Ronacher: Pi - The Minimal Agent Within OpenClaw

**Source:** https://lucumr.pocoo.org/2026/1/31/pi/
**Fetched:** April 2, 2026

Armin Ronacher (creator of Flask, CTO of Sentry) wrote about why he uses pi almost exclusively as his coding agent. Key points:

- Pi has the shortest system prompt of any agent and only four tools: Read, Write, Edit, Bash
- It makes up for its tiny core with an extension system that allows state persistence into sessions
- Pi itself is "written like excellent software" -- no flicker, low memory, very reliable
- No MCP support by design -- the philosophy is that the agent should extend itself by writing code
- Pi sessions are trees: you can branch, navigate, and rewind without losing context
- Ronacher's extensions include `/answer`, `/todos`, `/review`, `/control`, `/files`
- His skills include `/web-browser` (via Chrome CDP), `/commit`, `/github`, `/sentry`, `/ghidra`
- He fully replaced all CLI/MCP browser automation with a skill that uses CDP directly
- OpenClaw uses pi as its core engine, connected to communication channels

---

## 2. Mario Zechner: Thoughts on Slowing the Fuck Down

**Source:** https://mariozechner.at/posts/2026-03-25-thoughts-on-slowing-the-fuck-down
**Fetched:** April 2, 2026

Mario's blog post (March 25, 2026) critiques how coding agents degrade software quality:

- Agent-generated code compounds errors at unsustainable rates because there's no human bottleneck
- An agent has no learning ability -- it will continue making the same errors over and over
- With orchestrated armies of agents, tiny booboos compound into unrecoverable complexity
- Agentic search has low recall: the bigger the codebase, the lower the recall, leading to duplication and inconsistency
- AWS had an AI-caused outage, followed by a 90-day reset
- Microsoft acknowledging Windows quality issues, committing to improvement
- Companies claiming 100% AI-generated code consistently produce the worst garbage
- Recommendation: agents for boring stuff, humans for architecture/design, slow down, review everything
- The end result: maintainable systems, fewer but right features, users who experience joy instead of slop

---

## 3. Tembo: 2026 Guide to Coding CLI Tools - 15 Agents Compared

**Source:** https://www.tembo.io/blog/coding-cli-tools-comparison
**Fetched:** April 2, 2026

Full comparison of 15 CLI coding tools organized into three categories:

**Big-Lab Native:**
- Claude Code (Anthropic): Full autonomy, 20+ tools, Claude-only
- Codex (OpenAI): Lightweight, ChatGPT subscription, kernel-level sandbox
- Gemini CLI (Google): Free tier (60 req/min), 1M context, Google Search grounding
- GitHub Copilot CLI: Native GitHub integration, MCP, Claude Sonnet 4.5/GPT-5

**Independent/Startup:**
- Amp (Sourcegraph): Deep mode, Oracle/Librarian sub-agents
- Aider: 39K stars, 100+ languages, voice-to-code
- Warp: Terminal replacement, multi-agent orchestration
- Augment CLI: Context Engine, SWE-Bench Pro #1
- Droid (Factory): Specialized sub-agents (Code, Knowledge, Reliability, Product)
- Kiro (AWS): Spec-driven development, EARS notation

**Open Source/Community:**
- OpenCode: 95K stars, 75+ providers, LSP, multi-session
- Goose (Block): Apache 2.0, MCP-native
- Crush (Charmbracelet): Cross-platform including Android
- Cline: VS Code native, human-in-the-loop
- Kilo: 500+ models, Memory Bank, Orchestrator mode

---

## 4. Competitor Tool Capabilities

### Claude Code Tools
**Source:** https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool

Built-in tools: read_file, write_file, list_directory, search_files, grep_search, run_command, WebSearch, WebFetch, TodoRead, TodoWrite, NotebookRead, NotebookEdit, exit_plan_mode. Web search is first-class and built-in.

### Codex CLI
**Source:** https://developers.openai.com/codex/cli/features/

Features: Interactive TUI, non-interactive exec mode, built-in web search (cached + live), /review command, multi-agent workflows (experimental), MCP support, kernel-level sandboxing (Seatbelt/Landlock/seccomp).

### Gemini CLI
**Source:** https://geminicli.com/docs/tools/web-search/

Built-in tools: file system operations, shell execution, `google_web_search` for real-time information, `web_fetch` for URL content. Plan mode (read-only), MCP support, GEMINI.md configuration, free tier (60 req/min, 1K/day).

---

## 5. OpenClaw Architecture

**Sources:**
- https://medium.com/@dingzhanjun/deep-dive-into-openclaw-architecture-code-ecosystem-e6180f34bd07
- https://robotpaper.ai/reference-architecture-openclaw-early-feb-2026-edition-opus-4-6/
- https://www.raspberrypi.com/news/turn-your-raspberry-pi-into-an-ai-agent-with-openclaw/

Architecture:
- Pi Engine embedded as dynamic library in OpenClaw Gateway (sub-2ms latency)
- Uses `createAgentSession()` from pi's SDK
- Gateway: WebSocket server (port 18789), manages client connections, session routing
- Memory system: 4 layers (JSONL transcripts, daily logs, long-term MEMORY.md, semantic vector search)
- Queue strategy: Lane-based command queue with collect/steer/followup modes
- Security: Linux namespaces, pairing system, sandboxed plugins
- Deployment: Mac mini, Raspberry Pi, VPS, Cloudflare Workers, Docker

---

## 6. Community Extensions Ecosystem

### Armin Ronacher (mitsuhiko/agent-stuff)
**Source:** https://github.com/mitsuhiko/agent-stuff

18 extensions: /answer, /review, /todos, /control, /files, multi-edit, loop, go-to-bed, whimsical, session-breakdown, uv, notify, split-fork, btw, context, prompt-editor

19 skills: /web-browser (CDP), /commit, /github, /sentry, /ghidra, /google-workspace, /apple-mail, /tmux, /mermaid, /librarian, /oebb-scotty, /anachb, /uv, /summarize, /openscad, /pi-share, /update-changelog, /frontend-design, /native-web-search

### nicobailon
**Source:** https://github.com/nicobailon/pi-subagents

pi-subagents: Chain/parallel/async orchestration with artifact management, agents defined as markdown with YAML frontmatter, scoped as builtin/user/project, live progress rendering.

pi-interactive-shell: Autonomous CLI control (vim, psql, ssh, npm run dev). Interactive/Hands-free/Dispatch modes. Users can take over with Ctrl+T.

### tomsej/pi-ext
**Source:** https://github.com/tomsej/pi-ext

Leader key (Ctrl+Space) command palette, session switcher, powerline footer, web access, code review, Ghostty integration.

### oh-my-pi (can1357)
**Source:** https://github.com/can1357/oh-my-pi

Fork adding: LSP (40+ languages), Python kernel, subagents framework, Time Traveling Streamed Rules (TTSR), web search (multi-provider), autonomous memory, MCP support, N-API bindings for grep/syntax highlighting.

---

## 7. Parallel AI Products and API

**Sources:**
- https://parallel.ai/
- https://docs.parallel.ai/integrations/cli
- https://parallel.ai/blog/parallel-search-api

**Products:**
- Search API: Natural language objectives, ranked URLs with token-efficient excerpts
- Extract API: URLs to clean markdown (JS-heavy, PDFs)
- Task/Research API: Multi-step research with citations and confidence scores
- Chat API: OpenAI-compatible streaming with web grounding
- FindAll API: Entity discovery and enrichment
- Monitor API: Continuous web change tracking with webhooks

**CLI:** `parallel-cli` supports search, extract, research run/status/poll, enrich run/suggest, findall, monitor

**Features:** SOC-2 Type II, zero data retention, declarative semantic search, token-efficient outputs, Python/TypeScript SDKs, MCP servers

---

## 8. Web Search API Comparison

**Source:** https://medium.com/@unicodeveloper/search-apis-for-ai-agents-we-tested-5-domains-heres-the-gap-2a03e09f9868

| Provider | Focus | Key Strength |
|----------|-------|-------------|
| Parallel | Enterprise deep research | Multi-hop reasoning, SOC-2 Type II, citations |
| Exa | Semantic/neural search | Specialized indexes (people, companies, code) |
| Tavily | Agentic workflows | RAG-native, plug-and-play default |
| Firecrawl | Search + extraction | Full-page scraping in one call |
| Perplexity | Conversational search | Fast iterative queries |
| Brave | Privacy-first | Independent index, no tracking |

---

## 9. Pi-Mono GitHub Issues and Feature Requests

**Sources:**
- https://github.com/badlogic/pi-mono/issues/2459
- https://github.com/badlogic/pi-mono/issues/2677
- https://github.com/badlogic/pi-mono/issues/2170
- https://github.com/badlogic/pi-mono/issues/2558
- https://github.com/badlogic/pi-mono/issues/2639
- https://github.com/badlogic/pi-mono/issues/2670

Key issues during research period:
- #2459: pi update no-op for npm packages (fixed)
- #2677: pi -p hangs with extensions (missing process.exit)
- #2170: Expose BashOperations for extensions (feature request)
- #2558: Guard extensions across git worktrees
- #2639: Merge edit tools argument into single (closed, merged into multi-edit)
- #2670: registerModel()/removeModel() for runtime registry mutations

---

## 10. Reddit and Community Discussions

**Sources:**
- https://www.reddit.com/r/GithubCopilot/comments/1rpjq4l/which_terminal_coding_agent_wins_in_2026_pi/
- https://www.reddit.com/r/LocalLLM/comments/1s7ksa5/experimenting_with_picodingagent/
- https://www.reddit.com/r/PiCodingAgent/

Key themes:
- Pi positioned as "NeoVim of AI coding agents"
- Debate between minimal harness (pi) vs big engineering harness (OpenCode)
- Users run pi with local models (Qwen, Devstral, GLM-4) on Raspberry Pi 5
- oh-my-pi fork gaining traction as "batteries-included" alternative
- r/PiCodingAgent dedicated subreddit exists
- Community consensus: pi preferred for speed, reliability, hackability

---

## 11. SWE-Bench and Benchmark Data

**Sources:**
- https://www.swebench.com/
- https://morphllm.com/ai-coding-agent

Top performers (SWE-bench Verified, March 2026):
- Gemini 3.1 Pro Preview: 78.80%
- Claude Opus 4.6 (Thinking) and GPT 5.4: 78.20% (tied)
- GPT 5.3 Codex: 78.00%
- Sonar Foundation Agent: 79.2% (with custom scaffolding)

Terminal-Bench 2.0: Codex CLI (GPT-5.3) leads at 77.3%

Pi itself isn't benchmarked separately -- performance depends on which LLM is used.

---

## 12. Pi Operating Modes and Extension API

**Sources:**
- https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/rpc.md
- https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/extensions.md
- https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/prompt-templates.md
- https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/keybindings.md
- https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/packages.md

**Four modes:** Interactive (TUI), Print/JSON (scripting), RPC (JSON-RPC over stdin/stdout), SDK (embedding)

**Extension API:** registerTool() with promptSnippet + promptGuidelines, registerCommand(), registerShortcut(), registerFlag(), event handlers (session_start, tool_call, tool_result, input, before_agent_start, agent_start, agent_end, turn_start, turn_end)

**ToolDefinition interface:** name, label, description, promptSnippet, promptGuidelines, parameters (TypeBox), execute(), renderCall(), renderResult()

**Prompt templates:** Markdown files in ~/.pi/agent/prompts/ or .pi/prompts/, invoked via /name, support $1/$2/$ARGUMENTS placeholders

**Keybindings:** Configurable via ~/.pi/agent/keybindings.json, namespaced IDs since v0.61

**Packages:** npm/git distribution with pi-package keyword, pi install/update/list/config commands

---

## 13. Mario Zechner Background

**Sources:**
- https://gamedevdays.com/speaker/mario-zechner/
- https://syntax.fm/show/976/pi-the-ai-harness-that-powers-openclaw-w-armin-ronacher-and-mario-zechner/transcript
- https://mariozechner.at/posts/2025-11-30-pi-coding-agent/

- Creator of libGDX (major open-source game framework)
- 30+ years in software (R&D, mobile tools, compilers, gaming startups)
- Co-authored "Beginning Android Games"
- Austrian-based, speaks at Game Dev Days Graz
- Active at @badlogicgames on X
- Appeared on Syntax podcast (Episode 976) with Armin Ronacher
- Philosophy: "Bash is all you need" -- minimal harness, maximum model capability
- Pi's domain: pi.dev (also accessible via shittycodingagent.ai)

---

## Search Queries Executed

The following web searches were performed during research:

1. `pi-mono badlogic GitHub AI coding agent 2026`
2. `badlogic pi coding agent terminal tool March April 2026`
3. `"pi-mono" OR "pi coding agent" site:twitter.com OR site:x.com 2026`
4. `pi-mono changelog release v0.63 v0.64 March 2026 new features`
5. `pi coding agent badlogic comparison cursor codex claude code March April 2026`
6. `mariozechner pi-mono Twitter X blog post March April 2026`
7. `pi coding agent extensions skills web search tool MCP integration 2026`
8. `pi-mono issues feature requests tools March April 2026 GitHub`
9. `coding agent trends 2026 web search tool code execution sandbox`
10. `pi-mono "web search" extension OR tool OR skill site:github.com`
11. `pi coding agent community extensions popular npm packages skills 2026`
12. `pi-mono coding agent Hacker News Reddit discussion March April 2026`
13. `pi-mono "feat/web-search" branch OR extension web search tool`
14. `coding agent web search tool built-in 2026 Claude Code Codex Gemini CLI comparison`
15. `pi-mono pi coding agent news April 2026`
16. `pi coding agent mariozechner badlogic latest updates 2026`
17. `"pi coding agent" OR "pi-mono" review blog post March April 2026`
18. `pi coding agent Hacker News discussion 2026`
19. `pi coding agent extensions marketplace popular packages 2026`
20. `pi coding agent vs claude code vs codex CLI comparison 2026`
21. `pi coding agent YouTube video tutorial demo 2026`
22. `site:reddit.com pi coding agent OR pi-mono 2026`
23. `reddit pi coding agent terminal alternative 2026`
24. `pi coding agent OpenClaw Armin Ronacher 2026`
25. `Tembo "coding CLI tools comparison" 2026 pi`
26. `OpenClaw ClawdBot MoltBot AI assistant how it uses pi coding agent architecture 2026`
27. `oh-my-pi fork pi coding agent features LSP subagents web search 2026`
28. `claude code tools list built-in capabilities 2026 web search fetch`
29. `OpenAI codex CLI tools capabilities sandbox 2026`
30. `Gemini CLI tools capabilities web search 2026 Google`
31. `pi coding agent community extensions tomsej pi-ext nicobailon subagents interactive-shell 2026`
32. `Armin Ronacher mitsuhiko agent-stuff pi extensions skills CDP browser 2026`
33. `pi coding agent v0.64.0 release notes new features March 2026`
34. `pi coding agent prepareArguments hook tool definition extension API 2026`
35. `pi-mono ModelRegistry.create inMemory breaking change v0.64 2026`
36. `OpenClaw architecture pi-mono SDK createAgentSession embedding runtime 2026`
37. `pi coding agent session branching tree navigation compaction auto-compact 2026`
38. `pi coding agent Slack bot pi-mom self-managing deployment 2026`
39. `pi coding agent TUI differential rendering terminal framework components 2026`
40. `pi coding agent print mode JSON RPC SDK four modes scripting 2026`
41. `pi coding agent keybindings namespaced configurable customization 2026`
42. `pi coding agent parallel AI web search API comparison Brave Tavily Exa Perplexity 2026`
43. `parallel.ai API web search CLI tool developer documentation 2026`
44. `pi coding agent prompt template system .pi/prompts custom templates 2026`
45. `pi coding agent theme customization terminal UI styling 2026`
46. `pi coding agent OAuth login Anthropic Google OpenAI Codex authentication free 2026`
47. `pi coding agent SWE-bench benchmark performance evaluation 2026`
48. `pi coding agent Bedrock Azure Vertex Google providers enterprise deployment 2026`
49. `shittycodingagent.ai pi package gallery marketplace popular extensions 2026`
50. `pi coding agent cost tracking token usage context window management footer 2026`
51. `Mario Zechner libGDX creator pi coding agent interview podcast talk 2026`
52. `pi coding agent GitHub stars growth contributors March April 2026`
53. `pi coding agent "web search" OR "parallel" integration extension 2026`
54. `pi coding agent extension feature requests most wanted 2026 GitHub issues`
55. `parallel-cli deep research tool async polling status integration coding agent 2026`
56. `coding agent web search best practices renderCall renderResult custom TUI display 2026`
57. `parallel-cli extract output format JSON structure fields excerpts 2026`

**Web pages fetched:**
- https://lucumr.pocoo.org/2026/1/31/pi/ (Armin Ronacher blog post)
- https://mariozechner.at/posts/2026-03-25-thoughts-on-slowing-the-fuck-down (Mario Zechner blog post)
- https://github.com/badlogic/pi-mono/releases (GitHub releases page)
- https://www.tembo.io/blog/coding-cli-tools-comparison (Tembo comparison article)
