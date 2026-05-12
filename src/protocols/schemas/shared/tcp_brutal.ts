import { z } from "zod";

// Shared TCP Brutal congestion control configuration
// https://sing-box.sagernet.org/configuration/shared/tcp-brutal/

export const TCPBrutalSchema = z.object({
    enabled: z.boolean().optional(),
    up_mbps: z.number(),
    down_mbps: z.number(),
});

export type TCPBrutal = z.infer<typeof TCPBrutalSchema>;
