import type { ProtocolParser } from "./base";
import { NaiveSchema, type NaiveOutbound } from "./schemas/naive";

export const naive: ProtocolParser = {
    scheme: "naive",

    parse(uri: string): NaiveOutbound {
        const parsed = new URL(uri);

        const outbound: NaiveOutbound = {
            type: "naive",
            tag: parsed.hash ? decodeURIComponent(parsed.hash.slice(1)) : `naive-${parsed.hostname}`,
            server: parsed.hostname ?? "",
            server_port: parseInt(parsed.port ?? "443", 10),
            tls: { enabled: true },
        };

        if (parsed.username) outbound.username = decodeURIComponent(parsed.username);
        if (parsed.password) outbound.password = decodeURIComponent(parsed.password);

        return NaiveSchema.parse(outbound);
    },
};
