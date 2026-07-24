#!/usr/bin/env node
import { resolve } from "node:path";
import { loadConfig } from "./config.js";
import { build } from "./build.js";
import { serve } from "./server.js";

/** Parse `--key value` and `--flag` pairs out of argv. */
function parseFlags(args: string[]): Record<string, string | boolean> {
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    }
  }
  return flags;
}

const HELP = `Markdown2Blog — a markdown-to-blog static site generator

Usage:
  md2blog build [options]     Generate the site into the output directory
  md2blog serve [options]     Build, then serve the site locally
  md2blog help                Show this message

Options:
  --root <dir>      Project root (default: current directory)
  --drafts          Include posts marked "draft: true"
  --port <n>        Port for 'serve' (default: 8080)

Configuration is read from <root>/site.config.json.
`;

async function main(): Promise<void> {
  const [command = "help", ...rest] = process.argv.slice(2);
  const flags = parseFlags(rest);
  const rootDir = resolve(
    typeof flags.root === "string" ? flags.root : process.cwd(),
  );

  switch (command) {
    case "build":
    case "serve": {
      const config = await loadConfig(rootDir);
      if (flags.drafts === true) config.includeDrafts = true;

      const start = Date.now();
      const result = await build(rootDir, config);
      const ms = Date.now() - start;
      console.log(
        `Built ${result.postCount} post(s), ${result.tagCount} tag(s)` +
          `${result.draftCount ? `, ${result.draftCount} draft(s) ${config.includeDrafts ? "included" : "skipped"}` : ""}` +
          ` → ${result.outDir} (${ms}ms)`,
      );

      if (command === "serve") {
        const port =
          typeof flags.port === "string" ? Number(flags.port) : 8080;
        serve(result.outDir, Number.isFinite(port) ? port : 8080);
      }
      break;
    }
    case "help":
    case "--help":
    case "-h":
      console.log(HELP);
      break;
    default:
      console.error(`Unknown command: ${command}\n`);
      console.log(HELP);
      process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack : err);
  process.exitCode = 1;
});
