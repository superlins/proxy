import type { ProtocolParser } from "./base";
import { SocksSchema, type SocksOutbound } from "./schemas/socks";

export const socks: ProtocolParser = {
    scheme: "socks",

    parse(uri: string): SocksOutbound {
        const parsed = new URL(uri);

        const outbound: SocksOutbound = {
            type: "socks",
            tag: parsed.hash ? decodeURIComponent(parsed.hash.slice(1)) : `socks-${parsed.hostname}`,
            server: parsed.hostname ?? "",
            server_port: parseInt(parsed.port ?? "1080", 10),
            version: "5",
        };

        if (parsed.username) outbound.username = decodeURIComponent(parsed.username);
        if (parsed.password) outbound.password = decodeURIComponent(parsed.password);

        return SocksSchema.parse(outbound);
    },
};
