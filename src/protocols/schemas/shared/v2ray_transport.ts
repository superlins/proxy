import { z } from "zod";

// Shared V2Ray transport configuration
// https://sing-box.sagernet.org/configuration/shared/v2ray-transport/

const HTTPTransportSchema = z.object({
    type: z.literal("http"),
    host: z.array(z.string()).optional(),
    path: z.string().optional(),
    method: z.string().optional(),
    headers: z.record(z.string()).optional(),
    idle_timeout: z.string().optional(),
    ping_timeout: z.string().optional(),
});

const WebSocketTransportSchema = z.object({
    type: z.literal("ws"),
    path: z.string().optional(),
    headers: z.record(z.string()).optional(),
    max_early_data: z.number().int().optional(),
    early_data_header_name: z.string().optional(),
});

const QUICTransportSchema = z.object({
    type: z.literal("quic"),
});

const GRPCTransportSchema = z.object({
    type: z.literal("grpc"),
    service_name: z.string().optional(),
    idle_timeout: z.string().optional(),
    ping_timeout: z.string().optional(),
    permit_without_stream: z.boolean().optional(),
});

const HTTPUpgradeTransportSchema = z.object({
    type: z.literal("httpupgrade"),
    host: z.string().optional(),
    path: z.string().optional(),
    headers: z.record(z.string()).optional(),
});

export const V2RayTransportSchema = z.discriminatedUnion("type", [
    HTTPTransportSchema,
    WebSocketTransportSchema,
    QUICTransportSchema,
    GRPCTransportSchema,
    HTTPUpgradeTransportSchema,
]);

export type V2RayTransport = z.infer<typeof V2RayTransportSchema>;
