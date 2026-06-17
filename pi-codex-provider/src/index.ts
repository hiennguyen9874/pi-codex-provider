import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Box, Text, truncateToWidth } from "@earendil-works/pi-tui";
import { registerOpenAICodexCustomProvider } from "./providers/openai-codex-custom-provider.ts";
import { readCodexConversionConfig, type CodexConversionConfig } from "./adapter/activation/config.ts";
import type { AdapterState } from "./adapter/activation/state.ts";
import { rewriteCodexProviderRequest } from "./adapter/provider-request.ts";
import { handleCodexSessionBeforeCompact } from "./adapter/compaction/compaction.ts";
import { isNativeCompactionDetails, NATIVE_COMPACTION_DISPLAY_MESSAGE_TYPE, NATIVE_COMPACTION_DISPLAY_TEXT } from "./adapter/compaction/types.ts";
import { isAdapterContextExcludedCustomMessage } from "./adapter/prompt/context-filter.ts";
import { registerCodexCommand } from "./ui/settings/command.ts";

export default function codexProvider(pi: ExtensionAPI) {
	const state: AdapterState = { enabled: false, cwd: process.cwd(), promptSkills: [], config: readCodexConversionConfig() };

	function applyConfig(config: CodexConversionConfig): void {
		state.config = config;
	}

	registerOpenAICodexCustomProvider(pi, {
		getCurrentCwd: () => state.cwd,
		getConfig: () => state.config.openai,
	});
	registerCodexCommand(pi, state, applyConfig);

	pi.registerMessageRenderer(NATIVE_COMPACTION_DISPLAY_MESSAGE_TYPE, (message, _options, theme) => {
		const box = new Box(1, 1, (text) => theme.bg("customMessageBg", text));
		box.addChild(new Text(theme.fg("customMessageLabel", theme.bold("[compaction]")), 0, 0));
		const content = typeof message.content === "string" ? message.content : NATIVE_COMPACTION_DISPLAY_TEXT;
		box.addChild(new Text(`\n${theme.fg("customMessageText", content)}`, 0, 0));
		const render = box.render.bind(box);
		box.render = (width) => render(width).map((line) => truncateToWidth(line, width, ""));
		return box;
	});

	pi.on("session_start", async (_event, ctx) => {
		state.cwd = ctx.cwd;
		state.config = readCodexConversionConfig();
	});

	pi.on("model_select", async (_event, ctx) => {
		state.cwd = ctx.cwd;
	});

	pi.on("before_provider_request", async (event, ctx) => {
		state.cwd = ctx.cwd;
		return rewriteCodexProviderRequest(event.payload, ctx, state);
	});

	pi.on("session_before_compact", async (event, ctx) => {
		state.cwd = ctx.cwd;
		return handleCodexSessionBeforeCompact(event, ctx, state, pi);
	});

	pi.on("session_compact", async (event) => {
		state.pendingPiCompactionNativeWindow = undefined;
		if (!event.fromExtension || !isNativeCompactionDetails(event.compactionEntry.details)) return;
		pi.sendMessage(
			{
				customType: NATIVE_COMPACTION_DISPLAY_MESSAGE_TYPE,
				content: NATIVE_COMPACTION_DISPLAY_TEXT,
				display: true,
				details: { compactionEntryId: event.compactionEntry.id },
			},
			{ triggerTurn: false },
		);
	});

	pi.on("context", async (event) => {
		const messages = event.messages.filter((message) => !isAdapterContextExcludedCustomMessage(message));
		return { messages };
	});
}
