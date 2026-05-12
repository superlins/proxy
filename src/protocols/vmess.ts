import type { ProtocolParser } from "./base";
import { VmessSchema, type VmessOutbound } from "./schemas/vmess";
import { parseQueryString, decodeBase64 } from "./utils";

export const vmess: ProtocolParser = {
    scheme: "vmess",

    parse(uri: string): VmessOutbound {
        const jsonStr = uri.startsWith("vmess://") ? uri.slice(8) : uri;
        const parsed = JSON.parse(decodeBase64(jsonStr.trim()));

        const outbound: VmessOutbound = {
            type: "vmess",
            tag: parsed.ps ?? `vmess-${parsed.add}`,
            server: parsed.add,
            server_port: parseInt(parsed.port, 10),
            uuid: parsed.id,
            alter_id: parseInt(parsed.aid ?? "0", 10),
            security: parsed.scy ?? "auto",
        };

        // TLS
        if (parsed.tls === "tls" || parsed.tls === true) {
            outbound.tls = {
                enabled: true,
                server_name: parsed.sni,
            };
        }

        // Transport
        const net = parsed.net ?? "tcp";
        if (net !== "tcp") {
            const transport: any = { type: net };
            if (net === "ws") {
                transport.path = parsed.path ?? "/";
                if (parsed.host) transport.headers = { Host: parsed.host };
            } else if (net === "grpc") {
                transport.service_name = parsed.path ?? "";
            } else if (net === "h2") {
                transport.type = "http";
                transport.host = parsed.host ? parsed.host.split(",") : [];
                transport.path = parsed.path ?? "/";
            } else if (net === "httpupgrade") {
                transport.path = parsed.path ?? "/";
                if (parsed.host) transport.headers = { Host: parsed.host };
            }
            outbound.transport = transport;
        }

        return VmessSchema.parse(outbound);
    },
};
