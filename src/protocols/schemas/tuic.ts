import { z } from "zod";
import { ProxyOutboundBaseSchema, ServerSchema } from "./base";
import { TLSOutboundSchema } from "./shared/tls";
import { DialSchema } from "./shared/dial";
import { QUICSchema } from "./shared/quic";

// https://sing-box.sagernet.org/configuration/outbound/tuic/
export const TuicSchema = ProxyOutboundBaseSchema
    .extend({ type: z.literal("tuic") })
    .merge(ServerSchema)
    .extend({
        uuid: z.string().min(1, "UUID 不能为空"),
        password: z.string().min(1, "密码不能为空"),
        congestion_control: z.enum(["cubic", "new_reno", "bbr"]).default("cubic"),
        udp_relay_mode: z.enum(["native", "quic"]).optional(),
        udp_over_stream: z.boolean().optional(),
        zero_rtt_handshake: z.boolean().optional(),
        heartbeat: z.string().optional(),
        network: z.enum(["tcp", "udp"]).optional(),
        tls: TLSOutboundSchema.required({ enabled: true }).partial().extend({
            enabled: z.boolean().default(true),
        }).optional(),
        // QUIC fields (shared, @since sing-box 1.14.0)
        /** @since sing-box 1.14.0 */
    })
    .merge(DialSchema)
    .merge(QUICSchema);

export type TuicOutbound = z.infer<typeof TuicSchema>;
