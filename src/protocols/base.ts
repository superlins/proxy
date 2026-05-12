import type { AnyOutbound } from "./schemas";

export interface ProtocolParser {
    /** Protocol scheme identifier, e.g. "vless", "vmess", "ss", "hysteria2", "trojan" */
    readonly scheme: string;
    /** Additional scheme aliases, e.g. "hy2" for hysteria2 */
    readonly aliases?: string[];
    /** Parse a share URI into a sing-box outbound object */
    parse(uri: string): AnyOutbound;
}
