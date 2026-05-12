import type { ProtocolParser } from "./base";
import { VlessSchema, type VlessOutbound } from "./schemas/vless";
import { parseQueryString, decodeBase64 } from "./utils";

const VALID_FINGERPRINTS = ["chrome", "firefox", "edge", "safari", "360", "qq", "ios", "android", "random", "randomized"] as const;
function validFingerprint(fp: string): typeof VALID_FINGERPRINTS[number] {
    return VALID_FINGERPRINTS.includes(fp as typeof VALID_FINGERPRINTS[number])
        ? fp as typeof VALID_FINGERPRINTS[number]
        : "chrome";
}

export const vless: ProtocolParser = {
    scheme: "vless",

    parse(uri: string): VlessOutbound {
        const parsed = new URL(uri);
        const params = parseQueryString(parsed.search.slice(1));

        const outbound: VlessOutbound = {
            type: "vless",
            tag: parsed.hash ? decodeURIComponent(parsed.hash.slice(1)) : `vless-${parsed.hostname}`,
            server: parsed.hostname ?? "",
            server_port: parseInt(parsed.port ?? "443", 10),
            uuid: parsed.username,
            flow: (params.flow as VlessOutbound["flow"]) ?? "",
        };

        // TLS
        if (params.security && params.security !== "none") {
            outbound.tls = {
                enabled: true,
            };
            if (params.sni) outbound.tls.server_name = params.sni;
            if (params.fp) {
                outbound.tls.utls = { enabled: true, fingerprint: validFingerprint(params.fp) };
            }
            if (params.security === "reality") {
                outbound.tls.reality = {
                    enabled: true,
                    public_key: params.pbk ?? "",
                    short_id: params.sid ?? "",
                };
            }
        }

        // Transport
        if (params.type && params.type !== "tcp") {
            const transportType = params.type;
            const transport: any = { type: transportType };
            if (transportType === "ws") {
                transport.path = params.path ?? "/";
                if (params.host) transport.headers = { Host: params.host };
            } else if (transportType === "grpc") {
                transport.service_name = params.serviceName ?? "";
            } else if (transportType === "h2" || transportType === "http") {
                transport.type = "http";
                transport.host = params.host ? params.host.split(",") : [];
                transport.path = params.path ?? "/";
            } else if (transportType === "httpupgrade") {
                transport.path = params.path ?? "/";
                if (params.host) transport.headers = { Host: params.host };
            }
            outbound.transport = transport;
        }

        return VlessSchema.parse(outbound);
    },
};
