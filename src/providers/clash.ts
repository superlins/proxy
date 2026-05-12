import type { AnyOutbound } from "../protocols";

// Clash proxy types
type ClashProxyType =
    | "ss"
    | "ssr"
    | "vmess"
    | "vless"
    | "trojan"
    | "hysteria"
    | "hysteria2"
    | "hy2"
    | "tuic"
    | "snell"
    | "socks5"
    | "http"
    | "shadowsocks"
    | "wireguard";

export interface ClashProxyBase {
    name: string;
    type: string;
    server: string;
    port: number;
    udp?: boolean;
    tfo?: boolean;
    "skip-cert-verify"?: boolean;
    "server-cert-fingerprint"?: string[];
}

export interface ClashSS extends ClashProxyBase {
    type: "ss" | "shadowsocks";
    cipher: string;
    password: string;
    plugin?: string;
    "plugin-opts"?: Record<string, unknown>;
    "udp-over-tcp"?: boolean;
    "udp-over-tcp-version"?: number;
}

export interface ClashVmess extends ClashProxyBase {
    type: "vmess";
    uuid: string;
    alterId?: number;
    cipher?: string;
    network?: "ws" | "h2" | "http" | "grpc" | "httpupgrade";
    tls?: boolean;
    "skip-cert-verify"?: boolean;
    "server-cert-fingerprint"?: string[];
    servername?: string; // SNI
    wsOpts?: {
        path?: string;
        headers?: Record<string, string>;
        "max-early-data"?: number;
        "early-data-header-name"?: string;
    };
    h2Opts?: {
        host?: string[];
        path?: string;
    };
    grpcOpts?: {
        "grpc-service-name"?: string;
    };
    httpOpts?: {
        method?: string;
        path?: string[];
        headers?: Record<string, string[]>;
    };
}

export interface ClashVless extends ClashProxyBase {
    type: "vless";
    uuid: string;
    flow?: string;
    network?: "ws" | "grpc" | "http" | "httpupgrade";
    tls?: boolean;
    "skip-cert-verify"?: boolean;
    "server-cert-fingerprint"?: string[];
    "client-fingerprint"?: string;
    servername?: string;
    wsOpts?: ClashVmess["wsOpts"];
    grpcOpts?: ClashVmess["grpcOpts"];
    realityOpts?: {
        enabled?: boolean;
        "public-key"?: string;
        "short-id"?: string;
    };
}

export interface ClashTrojan extends ClashProxyBase {
    type: "trojan";
    password: string;
    network?: "ws" | "grpc";
    "skip-cert-verify"?: boolean;
    "server-cert-fingerprint"?: string[];
    sni?: string;
    wsOpts?: ClashVmess["wsOpts"];
    grpcOpts?: ClashVmess["grpcOpts"];
}

export interface ClashHysteria extends ClashProxyBase {
    type: "hysteria";
    auth?: string;
    "auth-str"?: string;
    obfs?: string;
    protocol?: "udp" | "wechat-video" | "faketcp";
    up?: string;
    down?: string;
    "up-speed"?: number;
    "down-speed"?: number;
    "skip-cert-verify"?: boolean;
    sni?: string;
    alpn?: string[];
    recvWindowConn?: number;
    recvWindow?: number;
}

export interface ClashHysteria2 extends ClashProxyBase {
    type: "hysteria2" | "hy2";
    password: string;
    obfs?: string;
    "obfs-password"?: string;
    up?: string;
    down?: string;
    "up-speed"?: number;
    "down-speed"?: number;
    "skip-cert-verify"?: boolean;
    sni?: string;
}

export interface ClashTuic extends ClashProxyBase {
    type: "tuic";
    uuid: string;
    password: string;
    "congestion-controller"?: "cubic" | "new_reno" | "bbr";
    "udp-relay-mode"?: "native" | "quic";
    "reduce-rtt"?: boolean;
    "skip-cert-verify"?: boolean;
    sni?: string;
    alpn?: string[];
    "heartbeat-interval"?: number;
}

export type ClashProxy =
    | ClashSS
    | ClashVmess
    | ClashVless
    | ClashTrojan
    | ClashHysteria
    | ClashHysteria2
    | ClashTuic;

export function isClashConfig(content: string): boolean {
    const trimmed = content.trim();
    return trimmed.includes("proxies:") || trimmed.includes("proxies :") || trimmed.includes('"proxies"');
}

export function parseClashProxies(content: string): AnyOutbound[] {
    const proxies = extractProxies(content);
    return proxies.map(convertClashProxy).filter((p): p is AnyOutbound => p !== null);
}

function extractProxies(content: string): Array<Record<string, unknown>> {
    // Try YAML first
    let yamlContent = content;

    // If it looks like YAML but doesn't have "proxies:" at the top level,
    // it might be a base64-encoded YAML
    if (!content.includes("proxies:") && !content.includes("proxies :")) {
        // Try base64 decode
        const trimmed = content.trim();
        if (/^[A-Za-z0-9+/=\s-]+$/.test(trimmed)) {
            try {
                const decoded = Buffer.from(trimmed, "base64").toString("utf-8");
                if (decoded.includes("proxies:")) {
                    yamlContent = decoded;
                }
            } catch {
                // Not base64
            }
        }
    }

    // Simple YAML-like parser for proxies array
    const proxies: Array<Record<string, unknown>> = [];
    const proxiesMatch = yamlContent.match(/proxies\s*:\s*\n([\s\S]*?)(?=\n\S|\n$|$)/);
    if (!proxiesMatch) return proxies;

    const proxiesBlock = proxiesMatch[1]!;
    const items = proxiesBlock.split(/\n\s*-\s+/).filter(Boolean);

    for (const item of items) {
        const proxy: Record<string, unknown> = {};
        const lines = item.split("\n").filter(Boolean);

        for (const line of lines) {
            const colonIdx = line.indexOf(":");
            if (colonIdx === -1) continue;

            const key = line.slice(0, colonIdx).trim().replace(/^-/, "");
            let value: string = line.slice(colonIdx + 1).trim();

            // Remove quotes
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }

            // Parse arrays like [item1, item2]
            if (value.startsWith("[") && value.endsWith("]")) {
                const inner = value.slice(1, -1);
                proxy[key] = inner.split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
                continue;
            }

            // Parse booleans
            if (value === "true") { proxy[key] = true; continue; }
            if (value === "false") { proxy[key] = false; continue; }

            // Parse numbers
            if (/^\d+$/.test(value)) { proxy[key] = parseInt(value, 10); continue; }

            proxy[key] = value;
        }

        if (proxy.name && proxy.type) {
            proxies.push(proxy);
        }
    }

    return proxies;
}

function convertClashProxy(proxy: Record<string, unknown>): AnyOutbound | null {
    try {
        switch (proxy.type as ClashProxyType) {
            case "ss":
            case "shadowsocks":
                return convertSS(proxy);
            case "vmess":
                return convertVmess(proxy);
            case "vless":
                return convertVless(proxy);
            case "trojan":
                return convertTrojan(proxy);
            case "hysteria":
                return convertHysteria(proxy);
            case "hysteria2":
            case "hy2":
                return convertHysteria2(proxy);
            case "tuic":
                return convertTuic(proxy);
            case "socks5":
                return convertSocks5(proxy);
            case "http":
                return convertHttp(proxy);
            default:
                console.warn(`[Clash] Unsupported proxy type: ${proxy.type}`);
                return null;
        }
    } catch (err) {
        console.warn(`[Clash] Failed to convert proxy "${proxy.name}": ${err}`);
        return null;
    }
}

function convertSS(p: Record<string, unknown>): AnyOutbound {
    return {
        type: "shadowsocks",
        tag: p.name as string,
        server: p.server as string,
        server_port: p.port as number,
        method: p.cipher as string,
        password: p.password as string,
        plugin: p.plugin ? String(p.plugin) : undefined,
        plugin_opts: p["plugin-opts"] ? JSON.stringify(p["plugin-opts"]) : undefined,
        udp_over_tcp: p["udp-over-tcp"] === true ? {
            enabled: true,
            version: (p["udp-over-tcp-version"] as number) ?? 2,
        } : undefined,
    } as AnyOutbound;
}

function convertVmess(p: Record<string, unknown>): AnyOutbound {
    const network = (p.network ?? "tcp") as string;
    let transport: Record<string, unknown> | undefined;

    if (network === "ws" && p.wsOpts) {
        const ws = p.wsOpts as Record<string, unknown>;
        transport = {
            type: "ws",
            path: (ws.path as string) ?? "/",
            headers: ws.headers as Record<string, string> | undefined,
            max_early_data: ws["max-early-data"] as number | undefined,
            early_data_header_name: ws["early-data-header-name"] as string | undefined,
        };
    } else if (network === "grpc" && p.grpcOpts) {
        transport = {
            type: "grpc",
            service_name: (p.grpcOpts as Record<string, unknown>)["grpc-service-name"] as string | undefined,
        };
    } else if (network === "h2" || network === "http") {
        const h2 = (p.h2Opts ?? {}) as Record<string, unknown>;
        transport = {
            type: "http",
            host: (h2.host as string[]) ?? [],
            path: (h2.path as string) ?? "/",
        };
    } else if (network === "httpupgrade") {
        const ws = p.wsOpts as Record<string, unknown> | undefined;
        transport = {
            type: "httpupgrade",
            path: (ws?.path as string) ?? "/",
            headers: ws?.headers as Record<string, string> | undefined,
        };
    }

    const outbound: Record<string, unknown> = {
        type: "vmess",
        tag: p.name as string,
        server: p.server as string,
        server_port: p.port as number,
        uuid: p.uuid as string,
        alter_id: (p.alterId ?? 0) as number,
        security: (p.cipher ?? "auto") as string,
    };

    if (p.tls === true) {
        outbound.tls = {
            enabled: true,
            insecure: p["skip-cert-verify"] as boolean | undefined,
            server_name: (p.servername as string) ?? undefined,
        };
    }

    if (transport) outbound.transport = transport;

    return outbound as AnyOutbound;
}

function convertVless(p: Record<string, unknown>): AnyOutbound {
    const network = (p.network ?? "tcp") as string;
    let transport: Record<string, unknown> | undefined;

    if (network === "ws" && p.wsOpts) {
        const ws = p.wsOpts as Record<string, unknown>;
        transport = {
            type: "ws",
            path: (ws.path as string) ?? "/",
            headers: ws.headers as Record<string, string> | undefined,
        };
    } else if (network === "grpc" && p.grpcOpts) {
        transport = {
            type: "grpc",
            service_name: (p.grpcOpts as Record<string, unknown>)["grpc-service-name"] as string | undefined,
        };
    } else if (network === "httpupgrade") {
        const ws = p.wsOpts as Record<string, unknown> | undefined;
        transport = {
            type: "httpupgrade",
            path: (ws?.path as string) ?? "/",
        };
    }

    const outbound: Record<string, unknown> = {
        type: "vless",
        tag: p.name as string,
        server: p.server as string,
        server_port: p.port as number,
        uuid: p.uuid as string,
        flow: (p.flow as string) ?? "",
    };

    if (p.tls === true) {
        const tls: Record<string, unknown> = {
            enabled: true,
            insecure: p["skip-cert-verify"] as boolean | undefined,
            server_name: (p.servername as string) ?? undefined,
        };

        if (p["client-fingerprint"]) {
            tls.utls = {
                enabled: true,
                fingerprint: p["client-fingerprint"],
            };
        }

        if (p.realityOpts) {
            const reality = p.realityOpts as Record<string, unknown>;
            if (reality.enabled === true || reality["public-key"]) {
                tls.reality = {
                    enabled: true,
                    public_key: reality["public-key"] as string,
                    short_id: reality["short-id"] as string,
                };
            }
        }

        outbound.tls = tls;
    }

    if (transport) outbound.transport = transport;

    return outbound as AnyOutbound;
}

function convertTrojan(p: Record<string, unknown>): AnyOutbound {
    const network = p.network as string | undefined;
    let transport: Record<string, unknown> | undefined;

    if (network === "ws" && p.wsOpts) {
        const ws = p.wsOpts as Record<string, unknown>;
        transport = {
            type: "ws",
            path: (ws.path as string) ?? "/",
            headers: ws.headers as Record<string, string> | undefined,
        };
    } else if (network === "grpc" && p.grpcOpts) {
        transport = {
            type: "grpc",
            service_name: (p.grpcOpts as Record<string, unknown>)["grpc-service-name"] as string | undefined,
        };
    }

    const outbound: Record<string, unknown> = {
        type: "trojan",
        tag: p.name as string,
        server: p.server as string,
        server_port: p.port as number,
        password: p.password as string,
    };

    outbound.tls = {
        enabled: true,
        insecure: p["skip-cert-verify"] as boolean | undefined,
        server_name: (p.sni as string) ?? undefined,
    };

    if (transport) outbound.transport = transport;

    return outbound as AnyOutbound;
}

function convertHysteria(p: Record<string, unknown>): AnyOutbound {
    const outbound: Record<string, unknown> = {
        type: "hysteria",
        tag: p.name as string,
        server: p.server as string,
        server_port: p.port as number,
        tls: {
            enabled: true,
            insecure: p["skip-cert-verify"] as boolean | undefined,
            server_name: (p.sni as string) ?? undefined,
            alpn: p.alpn as string[] | undefined,
        },
    };

    if (p.up) outbound.up = p.up;
    if (p.down) outbound.down = p.down;
    if (p["up-speed"]) outbound.up_mbps = p["up-speed"] as number;
    if (p["down-speed"]) outbound.down_mbps = p["down-speed"] as number;
    if (p.obfs) outbound.obfs = p.obfs as string;
    if (p["auth-str"]) outbound.auth_str = p["auth-str"] as string;
    if (p.auth) outbound.auth = p.auth as string;
    if (p.protocol) outbound.network = p.protocol as string;

    return outbound as AnyOutbound;
}

function convertHysteria2(p: Record<string, unknown>): AnyOutbound {
    const outbound: Record<string, unknown> = {
        type: "hysteria2",
        tag: p.name as string,
        server: p.server as string,
        server_port: p.port as number,
        password: p.password as string,
        tls: {
            enabled: true,
            insecure: p["skip-cert-verify"] as boolean | undefined,
            server_name: (p.sni as string) ?? undefined,
        },
    };

    if (p.obfs) {
        outbound.obfs = {
            type: "salamander",
            password: p.obfs as string,
        };
    }

    if (p.up) outbound.up_mbps = parseMbps(p.up as string);
    if (p.down) outbound.down_mbps = parseMbps(p.down as string);
    if (p["up-speed"]) outbound.up_mbps = p["up-speed"] as number;
    if (p["down-speed"]) outbound.down_mbps = p["down-speed"] as number;

    return outbound as AnyOutbound;
}

function convertTuic(p: Record<string, unknown>): AnyOutbound {
    const outbound: Record<string, unknown> = {
        type: "tuic",
        tag: p.name as string,
        server: p.server as string,
        server_port: p.port as number,
        uuid: p.uuid as string,
        password: p.password as string,
        congestion_control: (p["congestion-controller"] as string) ?? "cubic",
        tls: {
            enabled: true,
            insecure: p["skip-cert-verify"] as boolean | undefined,
            server_name: (p.sni as string) ?? undefined,
            alpn: p.alpn as string[] | undefined,
        },
    };

    if (p["udp-relay-mode"]) outbound.udp_relay_mode = p["udp-relay-mode"] as string;
    if (p["reduce-rtt"] === true) outbound.zero_rtt_handshake = true;
    if (p["heartbeat-interval"]) outbound.heartbeat = `${p["heartbeat-interval"]}ms`;

    return outbound as AnyOutbound;
}

function convertSocks5(p: Record<string, unknown>): AnyOutbound {
    return {
        type: "socks",
        tag: p.name as string,
        server: p.server as string,
        server_port: p.port as number,
        version: "5",
        username: p.username as string | undefined,
        password: p.password as string | undefined,
    } as AnyOutbound;
}

function convertHttp(p: Record<string, unknown>): AnyOutbound {
    return {
        type: "http",
        tag: p.name as string,
        server: p.server as string,
        server_port: p.port as number,
        username: p.username as string | undefined,
        password: p.password as string | undefined,
    } as AnyOutbound;
}

function parseMbps(value: string): number {
    const match = value.match(/^(\d+(?:\.\d+)?)\s*(?:mbps?)?$/i);
    return match ? parseFloat(match[1]!) : parseInt(value, 10);
}
