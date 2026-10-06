import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { AnyOutbound, GroupOutbound } from "../protocols";

export interface BuildInput {
    /** Proxy nodes (parsed from subscriptions) */
    nodes: AnyOutbound[];
    /** Region groups created by pipeline */
    regionGroups: GroupOutbound[];
    /** Template file path or name */
    template: string;
}

export interface BuildOutput {
    config: Record<string, unknown>;
}

/**
 * Resolve template file path.
 * If template contains "/" it's treated as absolute/relative path.
 * Otherwise it's looked up in config/templates/.
 */
function resolveTemplate(template: string): string {
    if (template.includes("/")) return template;
    return resolve(process.cwd(), "config", "templates", template);
}

export function build({ nodes, regionGroups, template }: BuildInput): BuildOutput {
    const tplPath = resolveTemplate(template);
    const config: Record<string, unknown> = JSON.parse(readFileSync(tplPath, "utf-8"));

    // Ensure outbounds array exists
    const outbounds = (config.outbounds ??= []) as Array<Record<string, unknown>>;

    // 1. Inject proxy nodes
    for (const node of nodes) {
        outbounds.push(node as Record<string, unknown>);
    }

    // 2. Inject region groups
    for (const group of regionGroups) {
        outbounds.push(group as Record<string, unknown>);
    }

    // 3. Update service selector outbounds (Google/Telegram/etc) to include nodes + region groups
    updateServiceOutbounds(outbounds, nodes, regionGroups);

    // 4. Update AUTO urltest to include all nodes
    updateUrltestOutbound(outbounds, nodes.map((n) => n.tag));

    // 5. Update PROXY selector to include AUTO, region groups, and nodes
    updateProxyOutbound(outbounds, regionGroups, nodes);

    return { config };
}

/**
 * Update all selector outbounds except PROXY and AUTO.
 * These are service groups defined in the template (Google, Telegram, etc).
 * Their outbounds list gets refreshed with actual nodes + region groups.
 */
function updateServiceOutbounds(
    outbounds: Array<Record<string, unknown>>,
    nodes: AnyOutbound[],
    regionGroups: GroupOutbound[],
): void {
    const members = [...nodes.map((n) => n.tag), ...regionGroups.map((g) => g.tag), "DIRECT", "AUTO", "PROXY"];

    for (const ob of outbounds) {
        if (
            ob.type === "selector" &&
            ob.tag !== "PROXY" &&
            ob.tag !== "AUTO"
        ) {
            (ob.outbounds as string[] | undefined) = members;
        }
    }
}

function updateUrltestOutbound(
    outbounds: Array<Record<string, unknown>>,
    nodeTags: string[],
): void {
    const auto = outbounds.find((o) => o.type === "urltest");
    if (auto) {
        (auto.outbounds as string[] | undefined) = nodeTags;
    }
}

function updateProxyOutbound(
    outbounds: Array<Record<string, unknown>>,
    regionGroups: GroupOutbound[],
    nodes: AnyOutbound[],
): void {
    const proxy = outbounds.find((o) => o.tag === "PROXY") as Record<string, unknown> | undefined;
    if (proxy) {
        (proxy.outbounds as string[]) = [
            "DIRECT",
            "AUTO",
            ...regionGroups.map((g) => g.tag),
            ...nodes.map((n) => n.tag),
        ];
        (proxy.default as string | undefined) ??= "AUTO";
    }
}
