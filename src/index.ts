#!/usr/bin/env node

import { resolve } from "node:path";
import { run } from "./core/pipeline";

const configPath = process.argv[2] ?? resolve("config/pipeline.yaml");

run(configPath).catch((err) => {
    console.error("[proxy-gen] Fatal error:", err.message);
    process.exit(1);
});
