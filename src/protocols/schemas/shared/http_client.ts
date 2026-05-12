import { z } from "zod";
import { TLSOutboundSchema } from "./tls";
import { DialSchema } from "./dial";
import { HTTP2Schema } from "./http2";
import { QUICSchema } from "./quic";

// Shared HTTP Client configuration
// https://sing-box.sagernet.org/configuration/shared/http-client/
// @since sing-box 1.14.0

export const HTTPClientSchema = z.object({
    /** Default: "go" */
    engine: z.enum(["go", "apple"]).optional(),
    /** Default: 2 */
    version: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
    disable_version_fallback: z.boolean().optional(),
    headers: z.record(z.string()).optional(),
}).merge(HTTP2Schema)
    .merge(QUICSchema)
    .extend({
        tls: TLSOutboundSchema.optional(),
        dial: DialSchema.optional(),
    });

export type HTTPClient = z.infer<typeof HTTPClientSchema>;
