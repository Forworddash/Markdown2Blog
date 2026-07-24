import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { SiteConfig } from "./types.js";

/** Sensible defaults; anything in `site.config.json` overrides these. */
const DEFAULTS: SiteConfig = {
  title: "My Blog",
  description: "A blog generated from markdown.",
  url: "http://localhost:8080",
  author: "Anonymous",
  contentDir: "content",
  publicDir: "public",
  outDir: "site",
  includeDrafts: false,
};

/**
 * Load configuration from `site.config.json` in `rootDir`, merged over defaults.
 * Missing file is fine — defaults are used.
 */
export async function loadConfig(rootDir: string): Promise<SiteConfig> {
  const configPath = resolve(rootDir, "site.config.json");
  let fileConfig: Partial<SiteConfig> = {};

  if (existsSync(configPath)) {
    try {
      fileConfig = JSON.parse(await readFile(configPath, "utf8"));
    } catch (err) {
      throw new Error(
        `Failed to parse ${configPath}: ${(err as Error).message}`,
      );
    }
  }

  return { ...DEFAULTS, ...fileConfig };
}
