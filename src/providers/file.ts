import { readFile } from "node:fs/promises";
import type { Provider } from "./base";

export class FileProvider implements Provider {
    constructor(
        public readonly name: string,
        private readonly path: string,
    ) {}

    async fetch(): Promise<string> {
        try {
            const content = await readFile(this.path, "utf-8");
            return content;
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            throw new Error(`[FileProvider] ${this.name}: failed to read "${this.path}" — ${msg}`);
        }
    }
}
