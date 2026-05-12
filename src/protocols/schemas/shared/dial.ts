import { z } from "zod";

// Shared Dial fields for outbound connections
// https://sing-box.sagernet.org/configuration/shared/dial/

export const DialSchema = z.object({
    detour: z.string().optional(),
    bind_interface: z.string().optional(),
    inet4_bind_address: z.string().optional(),
    inet6_bind_address: z.string().optional(),
    /** @since sing-box 1.13.0 */
    bind_address_no_port: z.boolean().optional(),
    /** accepts int or hex string like "0x1234" */
    routing_mark: z.union([z.number(), z.string()]).optional(),
    reuse_addr: z.boolean().optional(),
    /** @since sing-box 1.12.0 */
    netns: z.string().optional(),
    connect_timeout: z.string().optional(),
    tcp_fast_open: z.boolean().optional(),
    tcp_multi_path: z.boolean().optional(),
    /** @since sing-box 1.13.0 */
    disable_tcp_keep_alive: z.boolean().optional(),
    /** @since sing-box 1.13.0 */
    tcp_keep_alive: z.string().optional(),
    /** @since sing-box 1.13.0 */
    tcp_keep_alive_interval: z.string().optional(),
    udp_fragment: z.boolean().optional(),
    /** @since sing-box 1.12.0. A string is equivalent to setting server field. */
    domain_resolver: z.union([z.string(), z.object({
        server: z.string(),
        strategy: z.enum(["ipv4_only", "ipv6_only", "prefer_ipv4", "prefer_ipv6"]).optional(),
        disable_cache: z.boolean().optional(),
        disable_optimistic_cache: z.boolean().optional(),
        rewrite_ttl: z.number().nullish(),
        timeout: z.string().optional(),
        client_subnet: z.string().nullish(),
    })]).optional(),
    /** @deprecated sing-box 1.12.0, will be removed in 1.14.0 */
    domain_strategy: z.enum(["ipv4_only", "ipv6_only", "prefer_ipv4", "prefer_ipv6"]).optional(),
    /** @since sing-box 1.11.0 */
    network_strategy: z.enum(["default", "hybrid", "fallback"]).optional(),
    /** @since sing-box 1.11.0 */
    network_type: z.array(z.enum(["wifi", "cellular", "ethernet", "other"])).optional(),
    /** @since sing-box 1.11.0 */
    fallback_network_type: z.array(z.enum(["wifi", "cellular", "ethernet", "other"])).optional(),
    /** @since sing-box 1.11.0 */
    fallback_delay: z.string().optional(),
});

export type Dial = z.infer<typeof DialSchema>;
