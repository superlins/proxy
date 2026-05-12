import { z } from "zod";

// Shared UDP over TCP configuration
// https://sing-box.sagernet.org/configuration/shared/udp-over-tcp/

export const UDPOverTCPSchema = z.union([
    z.boolean(),
    z.object({
        enabled: z.boolean(),
        version: z.number().int().min(1).max(2).optional(),
    }),
]);

export type UDPOverTCP = z.infer<typeof UDPOverTCPSchema>;
