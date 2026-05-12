import type { Provider } from "./base";

/** Provider for inline URI strings (e.g. self-hosted nodes) */
export class UriProvider implements Provider {
    constructor(
        public readonly name: string,
        private readonly uri: string,
    ) {}

    async fetch(): Promise<string> {
        console.log(`[UriProvider] Using inline URI: ${this.name}`);
        return this.uri;
    }
}
