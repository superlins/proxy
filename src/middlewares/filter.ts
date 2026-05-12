import type { AnyOutbound } from "../protocols";
import type { Middleware } from "./index";

export interface FilterOptions {
    /** Exclude nodes whose tag matches any of these patterns */
    exclude?: string[];
    /** Only include nodes whose tag matches these patterns (optional) */
    include?: string[];
}

export function filterMiddleware(options: FilterOptions = {}): Middleware {
    return (nodes: AnyOutbound[]) => {
        let result = nodes;

        if (options.exclude?.length) {
            const patterns = options.exclude.map((p) => new RegExp(p, "i"));
            result = result.filter((n) => !patterns.some((re) => re.test(n.tag)));
        }

        if (options.include?.length) {
            const patterns = options.include.map((p) => new RegExp(p, "i"));
            result = result.filter((n) => patterns.some((re) => re.test(n.tag)));
        }

        return result;
    };
}
