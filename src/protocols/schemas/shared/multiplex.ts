import { z } from "zod";
import { TCPBrutalSchema } from "./tcp_brutal";

// Shared multiplex outbound configuration
// https://sing-box.sagernet.org/configuration/shared/multiplex#outbound

export const MultiplexOutboundSchema = z.object({
    enabled: z.boolean().optional(),
    protocol: z.enum(["smux", "yamux", "h2mux"]).optional(),
    max_connections: z.number().int().optional(),
    min_streams: z.number().int().optional(),
    max_streams: z.number().int().default(0).optional(),
    /** @since sing-box 1.3-beta9 */
    padding: z.boolean().optional(),
    brutal: TCPBrutalSchema.optional(),
});

export type MultiplexOutbound = z.infer<typeof MultiplexOutboundSchema>;
