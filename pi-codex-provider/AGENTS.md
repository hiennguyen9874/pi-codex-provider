# pi-codex-provider rules

- Scope: OpenAI Codex provider registration, WebSocket + SSE streaming, Responses API verbosity/fast/service-tier, native compaction with Pi fallback, and Pi ↔ Responses replay/message conversion.
- Out of scope (live in `pi-codex-conversion`, not here): tool adapter sync, apply_patch/exec/view_image/web_run/imagegen tools, PATH mode, system-prompt building, background-shell widget.
- Reference Codex repo for comparisons: `/home/igorw/Frameworks/codex`.
- When preparing npm/publish/release/merge, compare `src/providers/openai-codex-custom-provider.ts` against Pi's stock `openai-codex-responses` provider.
- Compatibility pass covers request shape, transport/headers, reasoning/service-tier handling, retry/stream terminal semantics, replay drift continuation, and compaction fallback.
- Do not accept review-bot drift from stock Pi behavior unless backend-verified or intentional.
