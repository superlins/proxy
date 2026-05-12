import type { ProtocolParser } from "./base";
import { SSHSchema, type SSHOutbound } from "./schemas/ssh";

export const ssh: ProtocolParser = {
    scheme: "ssh",

    parse(uri: string): SSHOutbound {
        const parsed = new URL(uri);

        const outbound: SSHOutbound = {
            type: "ssh",
            tag: parsed.hash ? decodeURIComponent(parsed.hash.slice(1)) : `ssh-${parsed.hostname}`,
            server: parsed.hostname ?? "",
            server_port: parseInt(parsed.port ?? "22", 10),
        };

        if (parsed.username) outbound.user = decodeURIComponent(parsed.username);
        if (parsed.password) outbound.password = decodeURIComponent(parsed.password);

        return SSHSchema.parse(outbound);
    },
};
