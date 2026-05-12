import { z } from "zod";
import { ProxyOutboundBaseSchema, ServerSchema } from "./base";
import { TLSOutboundSchema } from "./shared/tls";
import { DialSchema } from "./shared/dial";
import { MultiplexOutboundSchema } from "./shared/multiplex";
import { V2RayTransportSchema } from "./shared/v2ray_transport";

// https://sing-box.sagernet.org/configuration/outbound/trojan/
export const TrojanSchema = ProxyOutboundBaseSchema
    .extend({ type: z.literal("trojan") })
    .merge(ServerSchema)
    .extend({
        password: z.string().min(1, "密码不能为空"),
        network: z.enum(["tcp", "udp"]).optional(),
        tls: TLSOutboundSchema.optional(),
        multiplex: MultiplexOutboundSchema.optional(),
        transport: V2RayTransportSchema.optional(),
    })
    .merge(DialSchema);

export type TrojanOutbound = z.infer<typeof TrojanSchema>;
