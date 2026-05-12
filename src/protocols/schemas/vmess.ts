import { z } from "zod";
import { ProxyOutboundBaseSchema, ServerSchema } from "./base";
import { TLSOutboundSchema } from "./shared/tls";
import { DialSchema } from "./shared/dial";
import { MultiplexOutboundSchema } from "./shared/multiplex";
import { V2RayTransportSchema } from "./shared/v2ray_transport";

// https://sing-box.sagernet.org/configuration/outbound/vmess/
export const VmessSchema = ProxyOutboundBaseSchema
    .extend({ type: z.literal("vmess") })
    .merge(ServerSchema)
    .extend({
        uuid: z.string().min(1, "UUID 不能为空"),
        security: z.enum(["auto", "none", "zero", "aes-128-gcm", "chacha20-poly1305", "aes-128-ctr"]).default("auto"),
        alter_id: z.number().int().min(0).default(0),
        global_padding: z.boolean().optional(),
        authenticated_length: z.boolean().optional(),
        network: z.enum(["tcp", "udp"]).optional(),
        tls: TLSOutboundSchema.optional(),
        packet_encoding: z.enum(["", "packetaddr", "xudp"]).optional(),
        multiplex: MultiplexOutboundSchema.optional(),
        transport: V2RayTransportSchema.optional(),
    })
    .merge(DialSchema);

export type VmessOutbound = z.infer<typeof VmessSchema>;
