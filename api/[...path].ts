import { createApp } from "../apps/server/src/app.js";
import { parseEnv } from "../apps/server/src/config/env.js";

export default createApp(parseEnv(process.env));
