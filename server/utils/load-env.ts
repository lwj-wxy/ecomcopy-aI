import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadDotenv } from 'dotenv';

let loaded = false;

export function ensureServerEnvLoaded() {
  if (loaded) return;
  loaded = true;

  const cwd = process.cwd();
  const localEnvPath = resolve(cwd, '.env.local');
  const envPath = resolve(cwd, '.env');

  if (existsSync(localEnvPath)) {
    loadDotenv({ path: localEnvPath });
  }

  if (existsSync(envPath)) {
    loadDotenv({ path: envPath, override: false });
  }
}
