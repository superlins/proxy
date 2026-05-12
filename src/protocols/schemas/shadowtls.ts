import { z } from "zod";
import { ProxyOutboundBaseSchema, ServerSchema } from "./base";
import { TLSOutboundSchema } from "./shared/tls";
import { DialSchema } from "./shared/dial";

// https://sing-box.sagernet.org/configuration/outbound/shadowtls/
export const ShadowTLSSchema = ProxyOutboundBaseSchema
    .extend({ type: z.literal("shadowtls") })
    .merge(ServerSchema)
    .extend({
        version: z.number().int().min(1).max(3).default(1),
        password: z.string().optional(),
        tls: TLSOutboundSchema.optional(),
    })
    .merge(DialSchema);

export type ShadowTLSOutbound = z.infer<typeof ShadowTLSSchema>;
