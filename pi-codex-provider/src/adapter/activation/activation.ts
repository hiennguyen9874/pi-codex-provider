import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { isCodexLikeContext, isOpenAICodexContext } from "../prompt/codex-model.ts";
import type { CodexConversionConfig } from "./config.ts";

export function shouldUseCodexAdapter(ctx: ExtensionContext, config: CodexConversionConfig): boolean {
	return config.scope.allProviders || isConfiguredAdapterProvider(ctx, config) || isCodexLikeContext(ctx);
}

export function isConfiguredAdapterProvider(ctx: ExtensionContext, config: CodexConversionConfig): boolean {
	const provider = ctx.model?.provider?.trim().toLowerCase();
	return Boolean(provider && config.scope.additionalProviders.includes(provider));
}

export function shouldUseProxyNativeTools(ctx: ExtensionContext, config: CodexConversionConfig): boolean {
	return config.mode === "normal" && isConfiguredAdapterProvider(ctx, config);
}

export function isEffectiveOpenAICodexContext(ctx: ExtensionContext, config: CodexConversionConfig): boolean {
	return isOpenAICodexContext(ctx) || shouldUseProxyNativeTools(ctx, config);
}
