import type { ProtocolParser } from "./base";
import { TrojanSchema, type TrojanOutbound } from "./schemas/trojan";
import { parseQueryString } from "./utils";

const VALID_FINGERPRINTS = ["chrome", "firefox", "edge", "safari", "360", "qq", "ios", "android", "random", "randomized"] as const;
function validFingerprint(fp: string): typeof VALID_FINGERPRINTS[number] {
    return VALID_FINGERPRINTS.includes(fp as typeof VALID_FINGERPRINTS[number])
        ? fp as typeof VALID_FINGERPRINTS[number]
        : "chrome";
}

export const trojan: ProtocolParser = {
    scheme: "trojan",

    parse(uri: string): TrojanOutbound {
        const parsed = new URL(uri);
        const params = parseQueryString(parsed.search.slice(1));

        const outbound: TrojanOutbound = {
            type: "trojan",
            tag: parsed.hash ? decodeURIComponent(parsed.hash.slice(1)) : `trojan-${parsed.hostname}`,
            server: parsed.hostname ?? "",
            server_port: parseInt(parsed.port ?? "443", 10),
            password: decodeURIComponent(parsed.username),
            tls: { enabled: true },
        };

        if (params.sni) outbound.tls!.server_name = params.sni;
        if (params.fp) {
            outbound.tls!.utls = { enabled: true, fingerprint: validFingerprint(params.fp) };
        }
        if (params.insecure === "1") outbound.tls!.insecure = true;

        // Transport
        if (params.type && params.type !== "tcp") {
            const transport: any = { type: params.type };
            if (params.type === "ws") {
                transport.path = params.path ?? "/";
                if (params.host) transport.headers = { Host: params.host };
            } else if (params.type === "grpc") {
                transport.service_name = params.serviceName ?? "";
            }
            outbound.transport = transport;
        }

        return TrojanSchema.parse(outbound);
    },
};
