import { z } from "zod";
import { ProxyOutboundBaseSchema, ServerSchema } from "./base";
import { TLSOutboundSchema } from "./shared/tls";
import { DialSchema } from "./shared/dial";
import { HTTPClientSchema } from "./shared/http_client";
import { QUICSchema } from "./shared/quic";

// https://sing-box.sagernet.org/configuration/outbound/hysteria2/
export const Hysteria2Schema = ProxyOutboundBaseSchema
    .extend({ type: z.literal("hysteria2") })
    .merge(ServerSchema)
    .extend({
        /** @since sing-box 1.11.0 */
        server_ports: z.array(z.string()).optional(),
        /** @since sing-box 1.11.0 */
        hop_interval: z.string().optional(),
        /** @since sing-box 1.14.0 */
        hop_interval_max: z.string().optional(),
        up_mbps: z.number().optional(),
        down_mbps: z.number().optional(),
        obfs: z.object({
            type: z.literal("salamander"),
            password: z.string(),
        }).optional(),
        password: z.string().min(1, "密码不能为空"),
        network: z.enum(["tcp", "udp"]).optional(),
        tls: TLSOutboundSchema.optional(),
        /** @since sing-box 1.14.0 */
        bbr_profile: z.enum(["conservative", "standard", "aggressive"]).optional(),
        brutal_debug: z.boolean().optional(),
        /** @since sing-box 1.14.0 */
        realm: z.object({
            server_url: z.string(),
            token: z.string().optional(),
            realm_id: z.string(),
            stun_servers: z.array(z.string()),
            http_client: HTTPClientSchema.optional(),
        }).optional(),
    })
    .merge(DialSchema)
    .merge(QUICSchema);

export type Hysteria2Outbound = z.infer<typeof Hysteria2Schema>;
