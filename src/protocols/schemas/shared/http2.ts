import { z } from "zod";

// Shared HTTP/2 configuration
// https://sing-box.sagernet.org/configuration/shared/http2/
// @since sing-box 1.14.0

export const HTTP2Schema = z.object({
    idle_timeout: z.string().optional(),
    keep_alive_period: z.string().optional(),
    /** e.g. "64 MB" */
    stream_receive_window: z.string().optional(),
    /** e.g. "64 MB" */
    connection_receive_window: z.string().optional(),
    max_concurrent_streams: z.number().optional(),
});

export type HTTP2 = z.infer<typeof HTTP2Schema>;
