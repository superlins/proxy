import { z } from "zod";
import { ProxyOutboundBaseSchema, ServerSchema } from "./base";
import { DialSchema } from "./shared/dial";
import { UDPOverTCPSchema } from "./shared/udp_over_tcp";

// https://sing-box.sagernet.org/configuration/outbound/socks/
export const SocksSchema = ProxyOutboundBaseSchema
    .extend({ type: z.literal("socks") })
    .merge(ServerSchema)
    .extend({
        version: z.enum(["4", "4a", "5"]).default("5"),
        username: z.string().optional(),
        password: z.string().optional(),
        network: z.enum(["tcp", "udp"]).optional(),
        udp_over_tcp: UDPOverTCPSchema.optional(),
    })
    .merge(DialSchema);

export type SocksOutbound = z.infer<typeof SocksSchema>;
