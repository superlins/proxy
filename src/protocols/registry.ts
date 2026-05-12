import type { ProtocolParser } from "./base";
import type { AnyOutbound } from "./schemas";

const registry = new Map<string, ProtocolParser>();

export function registerParser(parser: ProtocolParser): void {
    registry.set(parser.scheme, parser);
    if (parser.aliases) {
        for (const alias of parser.aliases) {
            registry.set(alias, parser);
        }
    }
}

export function parseUri(uri: string): AnyOutbound {
    // Sanitize URI: remove accidental whitespace in the base part (before ? or #)
    // which causes `new URL()` constructor to fail.
    let cleaned = uri.trim();
    const delimiterIndex = cleaned.search(/[?#]/);
    let base = delimiterIndex === -1 ? cleaned : cleaned.slice(0, delimiterIndex);
    const suffix = delimiterIndex === -1 ? "" : cleaned.slice(delimiterIndex);
    base = base.replace(/\s/g, "");
    const sanitizedUri = base + suffix;

    const scheme = sanitizedUri.split("://")[0]!.toLowerCase();
    const parser = registry.get(scheme);
    if (!parser) throw new Error(`Unsupported protocol scheme: ${scheme}`);
    return parser.parse(sanitizedUri);
}

export function getSupportedSchemes(): string[] {
    return Array.from(new Set(registry.values())).map((p) => p.scheme);
}
