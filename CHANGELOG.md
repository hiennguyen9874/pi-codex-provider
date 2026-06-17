# Changelog

## 0.1.0

Initial extraction of the Codex provider/Responses adaptation slice from `pi-codex-conversion` as a standalone pi extension.

### Added
- Custom OpenAI Codex provider registration with OAuth and cached WebSocket upgrade.
- WebSocket streaming with continuation across parallel replay drift.
- SSE streaming, headers, request-body, usage, errors, constants, stream-events modules.
- Native Responses compaction with fallback to Pi's compaction flow (preserves prior opaque window).
- Responses API verbosity (`/codex low|medium|high`) and fast mode (priority service tier).
- Compaction model/reasoning config.
- SSE timeout matching Pi's Codex SSE timeout; no Codex context-window shrinking.
- Replay pipeline (`adapter/replay/`) for Pi ↔ Responses history stability.
- Pi ↔ Responses message conversion, ignoring non-Responses thinking signatures.

### Removed (relative to `pi-codex-conversion`)
- Tool adapter sync, apply_patch/exec/view_image/web_run/imagegen tools.
- PATH mode and PATH tool binaries.
- System-prompt building, prompt skills, runtime shell.
- Background-shell widget.
