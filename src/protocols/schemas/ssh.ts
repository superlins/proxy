import { z } from "zod";
import { ProxyOutboundBaseSchema, ServerSchema } from "./base";
import { DialSchema } from "./shared/dial";

// https://sing-box.sagernet.org/configuration/outbound/ssh/
export const SSHSchema = ProxyOutboundBaseSchema
    .extend({ type: z.literal("ssh") })
    .merge(ServerSchema)
    .extend({
        server_port: z.number().int().optional(),
        user: z.string().optional(),
        password: z.string().optional(),
        private_key: z.string().optional(),
        private_key_path: z.string().optional(),
        private_key_passphrase: z.string().optional(),
        host_key: z.array(z.string()).optional(),
        host_key_algorithms: z.array(z.string()).optional(),
        client_version: z.string().optional(),
        /** @since sing-box 1.14.0 */
        cipher: z.array(z.string()).optional(),
        /** @since sing-box 1.14.0 */
        mac: z.array(z.string()).optional(),
        /** @since sing-box 1.14.0 */
        kex_algorithm: z.array(z.string()).optional(),
    })
    .merge(DialSchema);

export type SSHOutbound = z.infer<typeof SSHSchema>;
