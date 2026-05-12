import { z } from "zod";
import { ProxyOutboundBaseSchema, ServerSchema } from "./base";
import { TLSOutboundSchema } from "./shared/tls";
import { DialSchema } from "./shared/dial";
import { UDPOverTCPSchema } from "./shared/udp_over_tcp";

// https://sing-box.sagernet.org/configuration/outbound/naive/
// @since sing-box 1.13.0
export const NaiveSchema = ProxyOutboundBaseSchema
    .extend({ type: z.literal("naive") })
    .merge(ServerSchema)
    .extend({
        username: z.string().optional(),
        password: z.string().optional(),
        insecure_concurrency: z.number().int().optional(),
        extra_headers: z.record(z.string()).optional(),
        udp_over_tcp: UDPOverTCPSchema.optional(),
        quic: z.boolean().optional(),
        quic_congestion_control: z.enum(["bbr", "bbr2", "cubic", "reno"]).optional(),
        tls: TLSOutboundSchema.required({ enabled: true }).partial().extend({
            enabled: z.boolean().default(true),
        }),
    })
    .merge(DialSchema);

export type NaiveOutbound = z.infer<typeof NaiveSchema>;
