import { z } from "zod";
import { ProxyOutboundBaseSchema, ServerSchema } from "./base";
import { TLSOutboundSchema } from "./shared/tls";
import { DialSchema } from "./shared/dial";

// https://sing-box.sagernet.org/configuration/outbound/http/
export const HTTPSchema = ProxyOutboundBaseSchema
    .extend({ type: z.literal("http") })
    .merge(ServerSchema)
    .extend({
        username: z.string().optional(),
        password: z.string().optional(),
        path: z.string().optional(),
        headers: z.record(z.string()).optional(),
        tls: TLSOutboundSchema.optional(),
    })
    .merge(DialSchema);

export type HTTPOutbound = z.infer<typeof HTTPSchema>;
