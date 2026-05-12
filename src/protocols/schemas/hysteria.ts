import { z } from "zod";
import { ProxyOutboundBaseSchema, ServerSchema } from "./base";
import { TLSOutboundSchema } from "./shared/tls";
import { DialSchema } from "./shared/dial";
import { QUICSchema } from "./shared/quic";

// https://sing-box.sagernet.org/configuration/outbound/hysteria/
export const HysteriaSchema = ProxyOutboundBaseSchema
    .extend({ type: z.literal("hysteria") })
    .merge(ServerSchema)
    .extend({
        /** @since sing-box 1.12.0 */
        server_ports: z.array(z.string()).optional(),
        /** @since sing-box 1.12.0 */
        hop_interval: z.string().optional(),
        up: z.string().optional(),
        down: z.string().optional(),
        up_mbps: z.number().optional(),
        down_mbps: z.number().optional(),
        obfs: z.string().optional(),
        auth: z.string().optional(),
        auth_str: z.string().optional(),
        network: z.enum(["tcp", "udp"]).optional(),
        tls: TLSOutboundSchema.optional(),
        // Deprecated in sing-box 1.14.0
        /** @deprecated sing-box 1.14.0, use QUIC stream_receive_window instead */
        recv_window_conn: z.number().int().optional(),
        /** @deprecated sing-box 1.14.0, use QUIC connection_receive_window instead */
        recv_window: z.number().int().optional(),
        /** @deprecated sing-box 1.14.0, use QUIC disable_path_mtu_discovery instead */
        disable_mtu_discovery: z.boolean().optional(),
    })
    .merge(DialSchema)
    .merge(QUICSchema);

export type HysteriaOutbound = z.infer<typeof HysteriaSchema>;
