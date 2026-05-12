import type { ProtocolParser } from "./base";
import { HysteriaSchema, type HysteriaOutbound } from "./schemas/hysteria";
import { parseQueryString } from "./utils";

export const hysteria: ProtocolParser = {
    scheme: "hysteria",

    parse(uri: string): HysteriaOutbound {
        const parsed = new URL(uri);
        const params = parseQueryString(parsed.search.slice(1));

        const outbound: HysteriaOutbound = {
            type: "hysteria",
            tag: parsed.hash ? decodeURIComponent(parsed.hash.slice(1)) : `hysteria-${parsed.hostname}`,
            server: parsed.hostname ?? "",
            server_port: parseInt(parsed.port ?? "443", 10),
            tls: { enabled: true },
        };

        if (params.up) outbound.up = params.up;
        if (params.down) outbound.down = params.down;
        if (params.upmbps) outbound.up_mbps = parseInt(params.upmbps, 10);
        if (params.downmbps) outbound.down_mbps = parseInt(params.downmbps, 10);
        if (params.obfs) outbound.obfs = params.obfs;
        if (params.auth_str) outbound.auth_str = params.auth_str;
        if (params.protocol) outbound.network = params.protocol as HysteriaOutbound["network"];
        if (params.sni) outbound.tls!.server_name = params.sni;
        if (params.insecure === "1") outbound.tls!.insecure = true;
        if (params.alpn) outbound.tls!.alpn = params.alpn.split(",");

        return HysteriaSchema.parse(outbound);
    },
};
