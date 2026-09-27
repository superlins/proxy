import { parse, stringify } from "yaml";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { z } from "zod";
import type { ProviderSource } from "../providers/factory";
import { createProvider } from "../providers/factory";
import { parseUri } from "../protocols";
import { parseClashProxies, isClashConfig } from "../providers/clash";
import type { AnyOutbound, GroupOutbound } from "../protocols";
import { filterMiddleware } from "../middlewares/filter";
import { renameMiddleware } from "../middlewares/rename";
import { createRegionGroups } from "../middlewares/group";
import { build } from "./builder";

const PipelineFullConfigSchema = z.object({
    providers: z.array(z.object({
        name: z.string(),
        source: z.string(),
        type: z.enum(["http", "file", "uri"]).optional(),
        timeout: z.number().optional(),
        userAgent: z.string().optional(),
    })),
    stages: z.array(z.object({
        name: z.string(),
        filter: z.object({
            exclude: z.array(z.string()).optional(),
            include: z.array(z.string()).optional(),
        }).optional(),
        rename: z.object({
            flag: z.boolean().optional(),
        }).optional(),
        group: z.object({
            region: z.boolean().optional(),
        }).optional(),
    })).optional(),
    output: z.object({
        template: z.string().default("v1.13.json"),
        dest: z.string().default("generated/config.json"),
    }).optional(),
});

export type FullConfig = z.infer<typeof PipelineFullConfigSchema>;

export async function run(configPath: string): Promise<void> {
    // Load config
    let raw = readFileSync(configPath, "utf-8");
    // Resolve ${ENV_VAR} placeholders with process.env
    raw = raw.replace(/\$\{(\w+)\}/g, (_, key) => {
        const value = process.env[key];
        if (!value) throw new Error(`Environment variable ${key} is not set`);
        return value;
    });
    const config = PipelineFullConfigSchema.parse(parse(raw));

    console.log(`[Pipeline] Loaded config: ${config.providers.length} providers`);

    // 1. Fetch all subscriptions concurrently
    console.log("[Pipeline] Fetching providers...");
    const rawContents = await Promise.all(
        config.providers.map(async (source) => {
            const provider = createProvider(source as ProviderSource);
            return provider.fetch();
        }),
    );

    // 2. Parse content into outbounds (URI or Clash format)
    console.log("[Pipeline] Parsing protocols...");
    const allNodes: AnyOutbound[] = [];
    for (const [i, content] of rawContents.entries()) {
        const name = config.providers[i]!.name;

        if (isClashConfig(content)) {
            const clashNodes = parseClashProxies(content);
            if (clashNodes.length === 0) {
                console.warn(`[Pipeline] ${name}: Clash config detected but no proxies found`);
            } else {
                console.log(`[Pipeline] ${name}: found ${clashNodes.length} Clash proxies`);
            }
            allNodes.push(...clashNodes);
        } else {
            const trimmed = content.trim();
            const allLines = trimmed.split(/\r?\n/);
            const lines = allLines.filter((l: string) => l.includes("://"));
            const skipped = allLines.length - lines.length;

            if (lines.length === 0) {
                console.warn(`[Pipeline] ${name}: content not recognized as Clash or URI format (first 100 chars: ${trimmed.slice(0, 100)})`);
            } else {
                console.log(`[Pipeline] ${name}: found ${lines.length} URIs, ${skipped} lines skipped`);
            }

            for (const line of lines) {
                try {
                    const outbound = parseUri(line.trim());
                    allNodes.push(outbound);
                } catch (err) {
                    console.warn(`[Pipeline] ${name}: failed to parse URI: ${err}`);
                }
            }
        }
    }
    console.log(`[Pipeline] Parsed ${allNodes.length} nodes total`);

    // 3. Apply stages
    let nodes = allNodes;
    if (config.stages) {
        for (const stage of config.stages) {
            const before = nodes.length;
            if (stage.filter) {
                nodes = filterMiddleware(stage.filter)(nodes);
                console.log(`[Pipeline] Stage "${stage.name}" filter: ${before} → ${nodes.length} nodes`);
            }
            if (stage.rename) {
                nodes = renameMiddleware(stage.rename)(nodes);
                console.log(`[Pipeline] Stage "${stage.name}" rename: ${nodes.length} nodes processed`);
            }
        }
    }

    // 4. Create region groups
    let regionGroups: GroupOutbound[] = [];
    const hasGroupStage = config.stages?.some((s) => s.group?.region);
    if (hasGroupStage) {
        regionGroups = createRegionGroups(nodes);
        console.log(`[Pipeline] Created ${regionGroups.length} region groups`);
    }

    // 5. Build final config
    console.log("[Pipeline] Building config...");
    const result = build({
        nodes,
        regionGroups,
        template: config.output?.template ?? "v1.13.json",
    });

    // 6. Write output
    const dest = resolve(config.output?.dest ?? "generated/config.json");
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, JSON.stringify(result.config, null, 2) + "\n");
    console.log(`[Pipeline] Written to ${dest}`);
}
