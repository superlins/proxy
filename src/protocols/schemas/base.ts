import { z } from "zod";

// Common outbound fields shared across proxy outbounds
export const ProxyOutboundBaseSchema = z.object({
    type: z.string(),
    tag: z.string(),
});

export type ProxyOutboundBase = z.infer<typeof ProxyOutboundBaseSchema>;

// Core server/port fields for connection-based outbounds
export const ServerSchema = z.object({
    server: z.string().min(1, "服务器地址不能为空"),
    server_port: z.number().int().min(1).max(65535, "端口号超出范围"),
});

export type Server = z.infer<typeof ServerSchema>;
