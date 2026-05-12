import type { ProtocolParser } from "./base";
import { TuicSchema, type TuicOutbound } from "./schemas/tuic";
import { parseQueryString } from "./utils";

export const tuic: ProtocolParser = {
    scheme: "tuic",

    parse(uri: string): TuicOutbound {
        const parsed = new URL(uri);
        const params = parseQueryString(parsed.search.slice(1));

        const outbound: TuicOutbound = {
            type: "tuic",
            tag: parsed.hash ? decodeURIComponent(parsed.hash.slice(1)) : `tuic-${parsed.hostname}`,
            server: parsed.hostname ?? "",
            server_port: parseInt(parsed.port ?? "443", 10),
            uuid: parsed.username ? decodeURIComponent(parsed.username) : "",
            password: parsed.password ? decodeURIComponent(parsed.password) : "",
            congestion_control: (params.congestion_control as TuicOutbound["congestion_control"]) ?? "cubic",
        };

        if (params.udp_relay_mode) outbound.udp_relay_mode = params.udp_relay_mode as TuicOutbound["udp_relay_mode"];
        if (params.udp_over_stream === "1") outbound.udp_over_stream = true;
        if (params.zero_rtt_handshake === "1") outbound.zero_rtt_handshake = true;
        if (params.heartbeat) outbound.heartbeat = params.heartbeat;

        // TLS (always enabled for TUIC)
        outbound.tls = { enabled: true };
        if (params.sni) outbound.tls.server_name = params.sni;
        if (params.insecure === "1") outbound.tls.insecure = true;
        if (params.alpn) outbound.tls.alpn = params.alpn.split(",");

        return TuicSchema.parse(outbound);
    },
};
