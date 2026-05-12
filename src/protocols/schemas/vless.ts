import { z } from "zod";
import { ProxyOutboundBaseSchema, ServerSchema } from "./base";
import { TLSOutboundSchema } from "./shared/tls";
import { DialSchema } from "./shared/dial";
import { MultiplexOutboundSchema } from "./shared/multiplex";
import { V2RayTransportSchema } from "./shared/v2ray_transport";

// https://sing-box.sagernet.org/configuration/outbound/vless/
export const VlessSchema = ProxyOutboundBaseSchema
    .extend({ type: z.literal("vless") })
    .merge(ServerSchema)
    .extend({
        uuid: z.string().min(1, "UUID 不能为空"),
        flow: z.enum(["", "xtls-rprx-vision"]).default(""),
        network: z.enum(["tcp", "udp"]).optional(),
        tls: TLSOutboundSchema.optional(),
        packet_encoding: z.enum(["", "packetaddr", "xudp"]).optional(),
        multiplex: MultiplexOutboundSchema.optional(),
        transport: V2RayTransportSchema.optional(),
    })
    .merge(DialSchema);

export type VlessOutbound = z.infer<typeof VlessSchema>;
