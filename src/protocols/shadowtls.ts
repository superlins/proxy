import type { ProtocolParser } from "./base";
import { ShadowTLSSchema, type ShadowTLSOutbound } from "./schemas/shadowtls";

export const shadowtls: ProtocolParser = {
    scheme: "shadowtls",

    parse(uri: string): ShadowTLSOutbound {
        const parsed = new URL(uri);

        const outbound: ShadowTLSOutbound = {
            type: "shadowtls",
            tag: parsed.hash ? decodeURIComponent(parsed.hash.slice(1)) : `shadowtls-${parsed.hostname}`,
            server: parsed.hostname ?? "",
            server_port: parseInt(parsed.port ?? "443", 10),
            version: 1,
            tls: { enabled: true },
        };

        if (parsed.password) outbound.password = decodeURIComponent(parsed.password);

        return ShadowTLSSchema.parse(outbound);
    },
};
