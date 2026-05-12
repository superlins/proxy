import { z } from "zod";

// Shared TLS outbound configuration
// https://sing-box.sagernet.org/configuration/shared/tls/#outbound

export const TLSOutboundSchema = z.object({
    enabled: z.boolean().optional(),

    /** @since sing-box 1.14.0 */
    engine: z.enum(["go", "apple", "windows"]).optional(),

    disable_sni: z.boolean().optional(),
    server_name: z.string().optional(),
    insecure: z.boolean().optional(),
    alpn: z.array(z.string()).optional(),
    min_version: z.enum(["1.0", "1.1", "1.2", "1.3"]).optional(),
    max_version: z.enum(["1.0", "1.1", "1.2", "1.3"]).optional(),
    cipher_suites: z.array(
        z.enum([
            "TLS_RSA_WITH_AES_128_CBC_SHA",
            "TLS_RSA_WITH_AES_256_CBC_SHA",
            "TLS_RSA_WITH_AES_128_GCM_SHA256",
            "TLS_RSA_WITH_AES_256_GCM_SHA384",
            "TLS_AES_128_GCM_SHA256",
            "TLS_AES_256_GCM_SHA384",
            "TLS_CHACHA20_POLY1305_SHA256",
            "TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA",
            "TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA",
            "TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA",
            "TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA",
            "TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256",
            "TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384",
            "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
            "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384",
            "TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256",
            "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256",
        ]),
    ).optional(),
    /** @since sing-box 1.13.0 */
    curve_preferences: z.array(
        z.enum(["P256", "P384", "P521", "X25519", "X25519MLKEM768"]),
    ).optional(),
    certificate: z.string().optional(),
    certificate_path: z.string().optional(),
    /** @since sing-box 1.13.0 */
    certificate_public_key_sha256: z.array(z.string()).optional(),
    /** @since sing-box 1.13.0 */
    client_certificate: z.array(z.string()).optional(),
    /** @since sing-box 1.13.0 */
    client_certificate_path: z.string().optional(),
    /** @since sing-box 1.13.0 */
    client_key: z.array(z.string()).optional(),
    /** @since sing-box 1.13.0 */
    client_key_path: z.string().optional(),

    /** @since sing-box 1.12.0 */
    fragment: z.boolean().optional(),
    /** @since sing-box 1.12.0 */
    fragment_fallback_delay: z.string().optional(),
    /** @since sing-box 1.12.0 */
    record_fragment: z.boolean().optional(),

    /** @since sing-box 1.14.0 */
    spoof: z.string().optional(),
    /** @since sing-box 1.14.0 */
    spoof_method: z.enum([
        "wrong-sequence",
        "wrong-checksum",
        "wrong-ack",
        "wrong-md5",
        "wrong-timestamp",
    ]).optional(),

    /** @since sing-box 1.13.0 */
    kernel_tx: z.boolean().optional(),
    /** @since sing-box 1.13.0 */
    kernel_rx: z.boolean().optional(),

    /** @since sing-box 1.14.0 */
    handshake_timeout: z.string().optional(),

    // ECH
    ech: z.object({
        enabled: z.boolean().optional(),
        config: z.array(z.string()).optional(),
        config_path: z.string().optional(),
        /** @since sing-box 1.13.0 */
        query_server_name: z.string().optional(),
        /** @deprecated sing-box 1.12.0, removed in 1.13.0 */
        pq_signature_schemes_enabled: z.boolean().optional(),
        /** @deprecated sing-box 1.12.0, removed in 1.13.0 */
        dynamic_record_sizing_disabled: z.boolean().optional(),
    }).optional(),

    // uTLS
    utls: z.object({
        enabled: z.boolean().optional(),
        fingerprint: z.enum([
            "chrome",
            "firefox",
            "edge",
            "safari",
            "360",
            "qq",
            "ios",
            "android",
            "random",
            "randomized",
        ]).optional(),
    }).optional(),

    // REALITY
    reality: z.object({
        enabled: z.boolean().optional(),
        public_key: z.string().optional(),
        short_id: z.string().optional(),
    }).optional(),
});

export type TLSOutbound = z.infer<typeof TLSOutboundSchema>;
