export type { ProtocolParser } from "./base";
export { registerParser, parseUri, getSupportedSchemes } from "./registry";

// Re-export schemas
export {
    ProxyOutboundBaseSchema,
    ServerSchema,
    TLSOutboundSchema,
    DialSchema,
    ShadowsocksSchema,
    VmessSchema,
    VlessSchema,
    Hysteria2Schema,
    TrojanSchema,
    TuicSchema,
    HTTPSchema,
    SocksSchema,
    NaiveSchema,
    HysteriaSchema,
    ShadowTLSSchema,
    AnyTLSSchema,
    SSHSchema,
    SelectorOutboundSchema,
    UrltestOutboundSchema,
} from "./schemas";

export type {
    ProxyOutboundBase,
    Server,
    TLSOutbound,
    Dial,
    AnyOutbound,
    ShadowsocksOutbound,
    VmessOutbound,
    VlessOutbound,
    Hysteria2Outbound,
    TrojanOutbound,
    TuicOutbound,
    HTTPOutbound,
    SocksOutbound,
    NaiveOutbound,
    HysteriaOutbound,
    ShadowTLSOutbound,
    AnyTLSOutbound,
    SSHOutbound,
    SelectorOutbound,
    UrltestOutbound,
    GroupOutbound,
} from "./schemas";

// Auto-register all parsers
import { registerParser } from "./registry";
import { vless } from "./vless";
import { vmess } from "./vmess";
import { shadowsocks } from "./shadowsocks";
import { hysteria2 } from "./hysteria2";
import { trojan } from "./trojan";
import { tuic } from "./tuic";
import { http } from "./http";
import { socks } from "./socks";
import { naive } from "./naive";
import { hysteria } from "./hysteria";
import { shadowtls } from "./shadowtls";
import { anytls } from "./anytls";
import { ssh } from "./ssh";

registerParser(vless);
registerParser(vmess);
registerParser(shadowsocks);
registerParser(hysteria2);
registerParser(trojan);
registerParser(tuic);
registerParser(http);
registerParser(socks);
registerParser(naive);
registerParser(hysteria);
registerParser(shadowtls);
registerParser(anytls);
registerParser(ssh);
