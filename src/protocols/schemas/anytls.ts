import { z } from "zod";
import { ProxyOutboundBaseSchema, ServerSchema } from "./base";
import { TLSOutboundSchema } from "./shared/tls";
import { DialSchema } from "./shared/dial";

// https://sing-box.sagernet.org/configuration/outbound/anytls/
export const AnyTLSSchema = ProxyOutboundBaseSchema
    .extend({ type: z.literal("anytls") })
    .merge(ServerSchema)
    .extend({
        password: z.string().min(1, "密码不能为空"),
        idle_session_check_interval: z.string().optional(),
        idle_session_timeout: z.string().optional(),
        min_idle_session: z.number().int().optional(),
        tls: TLSOutboundSchema.optional(),
    })
    .merge(DialSchema);

export type AnyTLSOutbound = z.infer<typeof AnyTLSSchema>;
