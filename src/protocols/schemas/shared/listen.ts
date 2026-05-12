import { z } from "zod";

// Shared Listen fields for inbound connections
// https://sing-box.sagernet.org/configuration/shared/listen/

export const ListenSchema = z.object({
    listen: z.string().optional(),
    listen_port: z.number().int().min(0).max(65535).optional(),
    /** @since sing-box 1.12.0 */
    bind_interface: z.string().optional(),
    /** @since sing-box 1.12.0 */
    routing_mark: z.union([z.number(), z.string()]).optional(),
    /** @since sing-box 1.12.0 */
    reuse_addr: z.boolean().optional(),
    /** @since sing-box 1.12.0 */
    netns: z.string().optional(),
    tcp_fast_open: z.boolean().optional(),
    tcp_multi_path: z.boolean().optional(),
    /** @since sing-box 1.13.0 */
    disable_tcp_keep_alive: z.boolean().optional(),
    /** @since sing-box 1.13.0 */
    tcp_keep_alive: z.string().optional(),
    tcp_keep_alive_interval: z.string().optional(),
    udp_fragment: z.boolean().optional(),
    udp_timeout: z.string().optional(),
    detour: z.string().optional(),
    /** @deprecated sing-box 1.11.0, removed in 1.13.0 */
    sniff: z.boolean().optional(),
    /** @deprecated sing-box 1.11.0, removed in 1.13.0 */
    sniff_override_destination: z.boolean().optional(),
    /** @deprecated sing-box 1.11.0, removed in 1.13.0 */
    sniff_timeout: z.string().optional(),
    /** @deprecated sing-box 1.11.0, removed in 1.13.0 */
    domain_strategy: z.enum(["prefer_ipv4", "prefer_ipv6", "ipv4_only", "ipv6_only"]).optional(),
    /** @deprecated sing-box 1.11.0, removed in 1.13.0 */
    udp_disable_domain_unmapping: z.boolean().optional(),
});

export type Listen = z.infer<typeof ListenSchema>;
