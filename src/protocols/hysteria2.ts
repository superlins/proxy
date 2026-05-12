import type { ProtocolParser } from "./base";
import { Hysteria2Schema, type Hysteria2Outbound } from "./schemas/hysteria2";
import { parseQueryString } from "./utils";

export const hysteria2: ProtocolParser = {
    scheme: "hysteria2",
    aliases: ["hy2"],

    parse(uri: string): Hysteria2Outbound {
        const parsed = new URL(uri);
        const params = parseQueryString(parsed.search.slice(1));

        const outbound: Hysteria2Outbound = {
            type: "hysteria2",
            tag: parsed.hash ? decodeURIComponent(parsed.hash.slice(1)) : `hy2-${parsed.hostname}`,
            server: parsed.hostname ?? "",
            server_port: parseInt(parsed.port ?? "443", 10),
            password: parsed.username ? decodeURIComponent(parsed.username) : "",
        };

        // Bandwidth
        if (params.upmbps) outbound.up_mbps = parseFloat(params.upmbps);
        if (params.downmbps) outbound.down_mbps = parseFloat(params.downmbps);

        // OBFS — obfs 指定类型，obfs-password 指定密码
        if (params.obfs && params["obfs-password"]) {
            outbound.obfs = { type: params.obfs as "salamander", password: params["obfs-password"] };
        }

        // TLS
        outbound.tls = { enabled: true };
        if (params.sni) outbound.tls.server_name = params.sni;
        if (params.insecure === "1") outbound.tls.insecure = true;

        return Hysteria2Schema.parse(outbound);
    },
};
