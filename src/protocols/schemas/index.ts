// Base schemas
export { ProxyOutboundBaseSchema, ServerSchema } from "./base";
export type { ProxyOutboundBase, Server } from "./base";

// Shared schemas
export { TLSOutboundSchema } from "./shared/tls";
export type { TLSOutbound } from "./shared/tls";
export { DialSchema } from "./shared/dial";
export type { Dial } from "./shared/dial";

// Protocol schemas
export { ShadowsocksSchema } from "./shadowsocks";
export type { ShadowsocksOutbound } from "./shadowsocks";

export { VmessSchema } from "./vmess";
export type { VmessOutbound } from "./vmess";

export { VlessSchema } from "./vless";
export type { VlessOutbound } from "./vless";

export { Hysteria2Schema } from "./hysteria2";
export type { Hysteria2Outbound } from "./hysteria2";

export { TrojanSchema } from "./trojan";
export type { TrojanOutbound } from "./trojan";

export { TuicSchema } from "./tuic";
export type { TuicOutbound } from "./tuic";

export { HTTPSchema } from "./http";
export type { HTTPOutbound } from "./http";

export { SocksSchema } from "./socks";
export type { SocksOutbound } from "./socks";

export { NaiveSchema } from "./naive";
export type { NaiveOutbound } from "./naive";

export { HysteriaSchema } from "./hysteria";
export type { HysteriaOutbound } from "./hysteria";

export { ShadowTLSSchema } from "./shadowtls";
export type { ShadowTLSOutbound } from "./shadowtls";

export { AnyTLSSchema } from "./anytls";
export type { AnyTLSOutbound } from "./anytls";

export { SSHSchema } from "./ssh";
export type { SSHOutbound } from "./ssh";

// Union type of all proxy outbounds
import type { ShadowsocksOutbound } from "./shadowsocks";
import type { VmessOutbound } from "./vmess";
import type { VlessOutbound } from "./vless";
import type { Hysteria2Outbound } from "./hysteria2";
import type { TrojanOutbound } from "./trojan";
import type { TuicOutbound } from "./tuic";
import type { HTTPOutbound } from "./http";
import type { SocksOutbound } from "./socks";
import type { NaiveOutbound } from "./naive";
import type { HysteriaOutbound } from "./hysteria";
import type { ShadowTLSOutbound } from "./shadowtls";
import type { AnyTLSOutbound } from "./anytls";
import type { SSHOutbound } from "./ssh";

export type AnyOutbound =
    | ShadowsocksOutbound
    | VmessOutbound
    | VlessOutbound
    | Hysteria2Outbound
    | TrojanOutbound
    | TuicOutbound
    | HTTPOutbound
    | SocksOutbound
    | NaiveOutbound
    | HysteriaOutbound
    | ShadowTLSOutbound
    | AnyTLSOutbound
    | SSHOutbound;

// Group outbounds (selector / urltest)
import { z } from "zod";

export const SelectorOutboundSchema = z.object({
    type: z.literal("selector"),
    tag: z.string(),
    outbounds: z.array(z.string()),
    default: z.string().optional(),
    interrupt_exist_connections: z.boolean().optional(),
});

export const UrltestOutboundSchema = z.object({
    type: z.literal("urltest"),
    tag: z.string(),
    outbounds: z.array(z.string()),
    url: z.string().optional(),
    interval: z.string().optional(),
    tolerance: z.number().optional(),
    interrupt_exist_connections: z.boolean().optional(),
});

export type SelectorOutbound = z.infer<typeof SelectorOutboundSchema>;
export type UrltestOutbound = z.infer<typeof UrltestOutboundSchema>;
export type GroupOutbound = SelectorOutbound | UrltestOutbound;
