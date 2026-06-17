import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import {
	normalizeCodexVerbosity,
	readCodexConversionConfig,
	writeCodexConversionConfig,
	type CodexConversionConfig,
} from "../../adapter/activation/config.ts";
import type { AdapterState } from "../../adapter/activation/state.ts";
import { openCodexSettingsScreen } from "./ui.ts";
import { consumeCodexRateLimitResetCredit, fetchCodexUsage, formatCodexUsage } from "./usage.ts";

const CODEX_COMMAND_COMPLETIONS = ["all", "status", "fast", "compact", "usage", "reset", "low", "medium", "high"] as const;
const CODEX_USAGE = "Usage: /codex, /codex all, /codex status, /codex fast, /codex compact, /codex usage, /codex reset, /codex low|medium|high";

export function registerCodexCommand(
	pi: ExtensionAPI,
	state: AdapterState,
	onConfigApplied?: (config: CodexConversionConfig) => void,
): void {
	function saveAndApply(ctx: ExtensionContext, nextConfig: CodexConversionConfig): boolean {
		const writeResult = writeCodexConversionConfig(nextConfig);
		if (!writeResult.ok) {
			ctx.ui.notify(`Failed to save Codex settings: ${writeResult.error}`, "error");
			return false;
		}
		state.config = nextConfig;
		onConfigApplied?.(nextConfig);
		return true;
	}

	pi.registerCommand("codex", {
		description: "Configure Codex adapter settings",
		getArgumentCompletions: (prefix) =>
			CODEX_COMMAND_COMPLETIONS.filter((item) => item.startsWith(prefix.trim().toLowerCase())).map((value) => ({ label: value, value })),
		handler: async (args, ctx) => {
			state.config = readCodexConversionConfig();
			const arg = args.trim().toLowerCase();
			if (arg === "usage" || arg === "reset") {
				let usage;
				try {
					usage = await fetchCodexUsage(ctx);
				} catch (error) {
					const message = error instanceof Error ? error.message : String(error);
					if (!ctx.hasUI) {
						ctx.ui.notify(message, "error");
						return;
					}
					await openCodexSettingsScreen(ctx, {
						initialConfig: state.config,
						initialTab: "usage",
						initialUsage: { error: message },
						onChange: (config) => saveAndApply(ctx, config),
					});
					return;
				}
				if (!ctx.hasUI) {
					ctx.ui.notify(formatCodexUsage(usage), "info");
					return;
				}
				await openCodexSettingsScreen(ctx, {
					initialConfig: state.config,
					initialTab: "usage",
					initialUsage: usage,
					onConsumeResetCredit: (redeemRequestId) => consumeCodexRateLimitResetCredit(ctx, redeemRequestId),
					onChange: (config) => saveAndApply(ctx, config),
				});
				return;
			}
			if (arg === "compact") {
				if (!ctx.hasUI) {
					ctx.ui.notify(formatCodexSettings(state.config), "info");
					return;
				}
				await openCodexSettingsScreen(ctx, {
					initialConfig: state.config,
					initialTab: "openai",
					onChange: (config) => saveAndApply(ctx, config),
				});
				return;
			}
			const nextConfig = getCommandConfigUpdate(arg, state.config);
			if (nextConfig) {
				saveAndApply(ctx, nextConfig);
				return;
			}

			if (arg) {
				ctx.ui.notify(CODEX_USAGE, "warning");
				return;
			}

			if (!ctx.hasUI) {
				ctx.ui.notify(formatCodexSettings(state.config), "info");
				return;
			}

			await openCodexSettingsScreen(ctx, {
				initialConfig: state.config,
				onChange: (config) => saveAndApply(ctx, config),
			});
		},
	});
}

function getCommandConfigUpdate(arg: string, config: CodexConversionConfig): CodexConversionConfig | undefined {
	if (arg === "fast") return { ...config, openai: { ...config.openai, fast: !config.openai.fast } };
	if (arg === "all") return { ...config, scope: { ...config.scope, allProviders: !config.scope.allProviders } };
	if (arg === "status") return { ...config, ui: { ...config.ui, statusLine: !config.ui.statusLine } };
	const verbosity = normalizeCodexVerbosity(arg);
	return verbosity ? { ...config, openai: { ...config.openai, verbosity } } : undefined;
}

function formatCodexSettings(config: CodexConversionConfig): string {
	return `Codex settings: all models ${config.scope.allProviders ? "on" : "off"}, additional providers ${config.scope.additionalProviders.length > 0 ? config.scope.additionalProviders.join(", ") : "none"}, statusline ${config.ui.statusLine ? "on" : "off"}, tool rendering ${config.ui.toolRendering ? "on" : "off"}, fast ${config.openai.fast ? "on" : "off"}, cached websocket upgrade ${config.openai.forceCachedWebSockets === false ? "off" : "on"}, responses compaction ${(config.compaction.responsesCompaction ?? false) ? "on" : "off"} (${config.openai.compactionModel}/${config.openai.compactionReasoning}), verbosity ${config.openai.verbosity}`;
}
