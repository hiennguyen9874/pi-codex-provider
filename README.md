# @hiennguyen9874/pi-codex-provider

> [!NOTE]
> This is the provider/transport slice of `pi-codex-conversion`, extracted as a standalone pi extension. It contains **only** the Codex provider and Responses-API adaptation layers — no tool adapters, no PATH mode, no system-prompt building. For the full Codex CLI–style tool surface (shell, patch, image, web, PATH mode), see [`pi-codex-conversion`](https://github.com/IgorWarzocha/howaboua-pi-stuff/tree/main/packages/pi-codex-conversion).

GPT/Codex models are strongest when the tool surface looks like the Codex CLI they were trained around: shell commands, resumable terminal sessions, and patch-based edits. This extension brings the Codex provider and Responses-API adaptation to Pi while keeping Pi's runtime, sessions, project context, skills, and UI.

## Install

```bash
pi install npm:@hiennguyen9874/pi-codex-provider
```

Or add it as a pi extension from a local checkout:

```bash
pi extension add @hiennguyen9874/pi-codex-provider
```

## Features

- **Custom OpenAI Codex provider** (`openai-codex-custom-provider.ts`) with OAuth, cached WebSocket upgrade, and SSE streaming.
- **WebSocket streaming** with continuation across parallel replay drift (`providers/openai-codex/websocket*.ts`).
- **SSE / headers / request-body / usage / errors** modules (`providers/openai-codex/`).
- **Native Responses compaction** with fallback to Pi's compaction flow, preserving the prior opaque window (`adapter/compaction/`).
- **Responses API verbosity** (`/codex low|medium|high`) and **fast mode** (priority service tier).
- **Compaction model/reasoning config** and **SSE timeout** matching Pi's Codex SSE timeout (no context-window shrinking).
- **Replay pipeline** keeping history stable across Pi ↔ Responses shape differences (`adapter/replay/`).
- **Pi ↔ Responses message conversion** (`providers/openai-responses/`), ignoring non-Responses thinking signatures so Anthropic signatures don't crash JSON parsing.

## What changes in Pi

- Adapter mode activates automatically for OpenAI `gpt*` and `codex*` models, then restores the previous tool set when you switch away.
- Pi's composed prompt is preserved; the extension only adds a small Codex-style tool-use nudge.
- Shell activity is rendered with Codex-like labels such as `Ran`, `Explored`, `Read`, and background-terminal status.
- Raw command output is still available by expanding the tool result.

## Settings

Use `/codex` to change adapter settings.

- `/codex` — open settings
- `/codex all` — use the Codex tool and prompt adapter on every model
- `/codex status` — toggle the footer/statusline entry
- `/codex fast` — toggle priority service tier for the OpenAI Codex provider
- `/codex compact` — open native compaction settings
- `/codex usage` — show Codex subscription usage windows for the active OpenAI Codex model
- `/codex reset` — open the Usage tab, where banked rate-limit resets can be used with Ctrl+R
- `/codex low`, `/codex medium`, `/codex high` — set Responses API verbosity

Settings are saved globally in `~/.pi/agent/pi-codex-provider.json`.

The settings UI has **General**, **OpenAI**, **Usage**, and **About** tabs. **Usage** refreshes automatically when opened, can be refreshed manually with `R`, and shows banked Codex rate-limit resets with their expiry above the usage windows. When resets are available, press `Ctrl+R` in the Usage tab to use one. After a reset attempt, press `R` before using another reset.

**General** controls scope, status UI, and whether native Responses compaction is enabled. Advanced users with custom Codex-compatible providers can add provider ids in General, or by editing `~/.pi/agent/pi-codex-provider.json`:

```json
{
  "scope": {
    "additionalProviders": ["my-provider"]
  }
}
```

**OpenAI** controls fast mode, verbosity, cached WebSocket upgrade, and compaction model/reasoning.

The footer shows the active state, for example:

```text
Codex adapter V: low • fast
```

## Details worth knowing

- The Codex provider uses OAuth, a cached WebSocket upgrade, and SSE streaming matching Pi's Codex SSE timeout.
- Native Responses compaction falls back to Pi's normal compaction flow on failure. When an older native compacted window exists, it is included in that Pi fallback summarization request so OpenAI can still use the prior opaque context server-side.
- The replay pipeline keeps history stable across Pi ↔ Responses shape differences, with continuation across parallel replay drift.
- Pi ↔ Responses message conversion ignores non-Responses thinking signatures so Anthropic signatures don't crash JSON parsing.

## Command rendering examples

- `rg -n foo src` -> `Explored / Search foo in src`
- `rg --files src | head -n 50` -> `Explored / List src`
- `cat README.md` -> `Explored / Read README.md`
- `npm test` -> `Ran npm test`
- `write_stdin({ session_id, chars: "" })` -> `Waited for background terminal`
- `write_stdin({ session_id, chars: "y\n" })` -> `Interacted with background terminal`

## Development checkout

The Git checkout is mostly for development and mirrors the maintainer workflow.

Run the current checkout without installing globally:

```bash
pi --no-extensions --no-skills -e /path/to/pi-codex-provider
```

## License

MIT
