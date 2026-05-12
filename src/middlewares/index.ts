import type { AnyOutbound } from "../protocols";

export type Middleware = (nodes: AnyOutbound[]) => AnyOutbound[];
