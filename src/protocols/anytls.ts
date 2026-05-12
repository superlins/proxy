import type { ProtocolParser } from "./base";
import { AnyTLSSchema, type AnyTLSOutbound } from "./schemas/anytls";

export const anytls: ProtocolParser = {
    scheme: "anytls",

    parse(uri: string): AnyTLSOutbound {
        const parsed = new URL(uri);

        const outbound: AnyTLSOutbound = {
            type: "anytls",
            tag: parsed.hash ? decodeURIComponent(parsed.hash.slice(1)) : `anytls-${parsed.hostname}`,
            server: parsed.hostname ?? "",
            server_port: parseInt(parsed.port ?? "443", 10),
            password: parsed.password ? decodeURIComponent(parsed.password) : "",
            tls: { enabled: true },
        };

        return AnyTLSSchema.parse(outbound);
    },
};
