import type { Provider } from "./base";

export class UrlProvider implements Provider {
    constructor(
        public readonly name: string,
        private readonly url: string,
        private readonly timeout = 15000,
    ) {}

    async fetch(): Promise<string> {
        console.log(`[UrlProvider] Fetching: ${this.name}`);

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeout);

        try {
            const res = await fetch(this.url, {
                signal: controller.signal,
                headers: {
                    "User-Agent": "sing-box/1.13.0 proxy-gen/0.1.0",
                },
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status} ${res.statusText}`);
            }

            let content = await res.text();

            // Try base64 decode: if the decoded content contains "://", use it
            const trimmed = content.trim();
            if (!trimmed.includes("://") && /^[A-Za-z0-9+/=\s-]+$/.test(trimmed)) {
                try {
                    const decoded = Buffer.from(trimmed, "base64").toString("utf-8");
                    if (decoded.includes("://")) {
                        content = decoded;
                    }
                } catch {
                    // Not valid base64, keep original
                }
            }

            console.log(`[UrlProvider] ${this.name}: fetched ${content.length} bytes`);
            return content;
        } finally {
            clearTimeout(timer);
        }
    }
}
