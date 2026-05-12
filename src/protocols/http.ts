import type { ProtocolParser } from "./base";
import { HTTPSchema, type HTTPOutbound } from "./schemas/http";

export const http: ProtocolParser = {
    scheme: "http",

    parse(uri: string): HTTPOutbound {
        const parsed = new URL(uri);

        const outbound: HTTPOutbound = {
            type: "http",
            tag: parsed.hash ? decodeURIComponent(parsed.hash.slice(1)) : `http-${parsed.hostname}`,
            server: parsed.hostname ?? "",
            server_port: parseInt(parsed.port ?? "80", 10),
        };

        if (parsed.username) outbound.username = decodeURIComponent(parsed.username);
        if (parsed.password) outbound.password = decodeURIComponent(parsed.password);

        return HTTPSchema.parse(outbound);
    },
};
