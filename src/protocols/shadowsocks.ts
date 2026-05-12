import type { ProtocolParser } from "./base";
import { ShadowsocksSchema, type ShadowsocksOutbound } from "./schemas/shadowsocks";
import { decodeBase64 } from "./utils";

// SIP002 methods (AEAD)
const AEAD_METHODS = new Set([
    "aes-128-gcm", "aes-192-gcm", "aes-256-gcm",
    "chacha20-ietf-poly1305", "xchacha20-ietf-poly1305",
    "2022-blake3-aes-128-gcm", "2022-blake3-aes-256-gcm",
    "2022-blake3-chacha20-poly1305",
]);

export const shadowsocks: ProtocolParser = {
    scheme: "ss",

    parse(uri: string): ShadowsocksOutbound {
        const raw = uri.startsWith("ss://") ? uri.slice(5) : uri;

        let method: string, password: string, server: string, server_port: number, tag: string;

        if (raw.includes("@")) {
            // SIP002: ss://base64(method:password)@server:port/#tag
            const [userInfo, hostAndRest] = raw.split("@");
            let decoded: string;
            try {
                decoded = decodeBase64(userInfo);
            } catch {
                decoded = decodeURIComponent(userInfo);
            }
            const colon = decoded.indexOf(":");
            method = decoded.slice(0, colon);
            password = decoded.slice(colon + 1);

            const hashIdx = hostAndRest.indexOf("#");
            const hostPart = hashIdx >= 0 ? hostAndRest.slice(0, hashIdx) : hostAndRest;
            server = hostPart.split(":")[0];
            server_port = parseInt(hostPart.split(":")[1], 10);
            tag = hashIdx >= 0 ? decodeURIComponent(hostAndRest.slice(hashIdx + 1)) : `ss-${server}`;
        } else {
            // Legacy: ss://base64(method:password@server:port)#tag
            const hashIdx = raw.indexOf("#");
            const tagPart = hashIdx >= 0 ? raw.slice(hashIdx + 1) : "";
            const dataPart = hashIdx >= 0 ? raw.slice(0, hashIdx) : raw;
            const decoded = decodeBase64(dataPart);
            const match = decoded.match(/^(.+?):(.+?)@(.+?):(\d+)$/);
            if (!match) throw new Error(`Invalid legacy SS URI: ${uri}`);
            [, method, password, server] = match;
            server_port = parseInt(match[4]!, 10);
            tag = tagPart ? decodeURIComponent(tagPart) : `ss-${server}`;
        }

        // Normalise method to lowercase
        method = method.toLowerCase();

        // Check if we need UoT for non-AEAD methods
        const outbound: ShadowsocksOutbound = {
            type: "shadowsocks",
            tag,
            server,
            server_port,
            method: method as ShadowsocksOutbound["method"],
            password,
        };

        if (!AEAD_METHODS.has(method)) {
            outbound.udp_over_tcp = { enabled: true, version: 2 };
        }

        return ShadowsocksSchema.parse(outbound);
    },
};
