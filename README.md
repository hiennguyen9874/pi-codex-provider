# @howaboua/pi-codex-provider

OpenAI Codex provider, Responses streaming, replay, and compaction adapter for the [pi coding agent](https://github.com/earendil-works/pi-coding-agent).

This is the provider/transport slice of `pi-codex-conversion`, extracted as a standalone pi extension. It contains **only** the Codex provider and Responses-API adaptation layers — no tool adapters, no PATH mode, no system-prompt building.

## Features

- **Custom OpenAI Codex provider** (`openai-codex-custom-provider.ts`) with OAuth, cached WebSocket upgrade, and SSE streaming.
- **WebSocket streaming** with continuation across parallel replay drift (`providers/openai-codex/websocket*.ts`).
- **SSE / headers / request-body / usage / errors** modules (`providers/openai-codex/`).
- **Native Responses compaction** with fallback to Pi's compaction flow, preserving the prior opaque window (`adapter/compaction/`).
- **Responses API verbosity** (`/codex low|medium|high`) and **fast mode** (priority service tier).
- **Compaction model/reasoning config** and **SSE timeout** matching Pi's Codex SSE timeout (no context-window shrinking).
- **Replay pipeline** keeping history stable across Pi ↔ Responses shape differences (`adapter/replay/`).
- **Pi ↔ Responses message conversion** (`providers/openai-responses/`), ignoring non-Responses thinking signatures so Anthropic signatures don't crash JSON parsing.

## Install

```sh
pi extension add @howaboua/pi-codex-provider
```

## Commands

- `/codex` — open settings
- `/codex all` — toggle adapter on all providers
- `/codex status` — toggle statusline
- `/codex fast` — toggle fast/priority service tier
- `/codex compact` — open compaction settings
- `/codex low|medium|high` — set Responses verbosity
- `/codex usage` / `/codex reset` — Codex usage / rate-limit reset

## License

MIT
