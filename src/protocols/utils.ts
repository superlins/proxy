/**
 * Decode base64 with UTF-8 support.
 */
export function decodeBase64(str: string): string {
    const binary = atob(str.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
}

/**
 * Safely parse a query string into a Record.
 */
export function parseQueryString(qs: string): Record<string, string> {
    if (!qs) return {};
    const params: Record<string, string> = {};
    for (const pair of qs.split("&")) {
        const [key, ...rest] = pair.split("=");
        params[decodeURIComponent(key)] = decodeURIComponent(rest.join("="));
    }
    return params;
}

/**
 * Serialize an object to JSON with keys sorted for deterministic output.
 */
export function toJson(obj: unknown): string {
    return JSON.stringify(obj, (_, v) =>
        typeof v === "object" && v !== null && !Array.isArray(v)
            ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)))
            : v,
    );
}
