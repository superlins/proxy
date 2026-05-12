import { z } from "zod";
import { ProxyOutboundBaseSchema, ServerSchema } from "./base";
import { DialSchema } from "./shared/dial";
import { UDPOverTCPSchema } from "./shared/udp_over_tcp";
import { MultiplexOutboundSchema } from "./shared/multiplex";

// https://sing-box.sagernet.org/configuration/outbound/shadowsocks/
export const ShadowsocksSchema = ProxyOutboundBaseSchema
    .extend({ type: z.literal("shadowsocks") })
    .merge(ServerSchema)
    .extend({
        method: z.enum([
            // 2022-blake3 AEAD
            "2022-blake3-aes-128-gcm",
            "2022-blake3-aes-256-gcm",
            "2022-blake3-chacha20-poly1305",
            // AEAD
            "aes-128-gcm",
            "aes-192-gcm",
            "aes-256-gcm",
            "chacha20-ietf-poly1305",
            "xchacha20-ietf-poly1305",
            // Stream ciphers
            "none",
            "aes-128-ctr",
            "aes-192-ctr",
            "aes-256-ctr",
            "aes-128-cfb",
            "aes-192-cfb",
            "aes-256-cfb",
            "rc4-md5",
            "chacha20-ietf",
            "xchacha20",
        ]),
        password: z.string().min(1, "密码不能为空"),
        plugin: z.enum(["obfs-local", "v2ray-plugin"]).optional(),
        plugin_opts: z.string().optional(),
        network: z.enum(["tcp", "udp"]).optional(),
        udp_over_tcp: UDPOverTCPSchema.optional(),
        multiplex: MultiplexOutboundSchema.optional(),
    })
    .merge(DialSchema);

export type ShadowsocksOutbound = z.infer<typeof ShadowsocksSchema>;
