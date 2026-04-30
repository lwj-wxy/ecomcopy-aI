import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';

let loaded = false;
function ensureServerEnvLoaded() {
  if (loaded) return;
  loaded = true;
  const cwd = process.cwd();
  const localEnvPath = resolve(cwd, ".env.local");
  const envPath = resolve(cwd, ".env");
  if (existsSync(localEnvPath)) {
    config({ path: localEnvPath });
  }
  if (existsSync(envPath)) {
    config({ path: envPath, override: false });
  }
}

export { ensureServerEnvLoaded as e };
//# sourceMappingURL=load-env.mjs.map
