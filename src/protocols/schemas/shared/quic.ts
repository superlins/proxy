import { z } from "zod";
import { HTTP2Schema } from "./http2";

// Shared QUIC configuration
// https://sing-box.sagernet.org/configuration/shared/quic/
// @since sing-box 1.14.0

export const QUICSchema = z.object({
    initial_packet_size: z.number().optional(),
    disable_path_mtu_discovery: z.boolean().optional(),
}).merge(HTTP2Schema);

export type QUIC = z.infer<typeof QUICSchema>;
