import { existsSync } from "node:fs";
import type { Provider } from "./base";
import { UrlProvider } from "./url";
import { FileProvider } from "./file";
import { UriProvider } from "./uri";

export type ProviderSourceType = "http" | "file" | "uri";

export interface ProviderSource {
    name: string;
    source: string;
    type?: ProviderSourceType;
    timeout?: number;
    userAgent?: string;
}

export function createProvider(source: ProviderSource): Provider {
    const resolvedType = source.type ?? autoDetectType(source.source);

    switch (resolvedType) {
        case "http":
            return new UrlProvider(source.name, source.source, source.timeout, source.userAgent);
        case "file":
            return new FileProvider(source.name, source.source);
        case "uri":
            return new UriProvider(source.name, source.source);
    }
}

function autoDetectType(src: string): ProviderSourceType {
    if (/^https?:\/\//.test(src)) return "http";
    if (existsSync(src)) return "file";
    return "uri";
}
