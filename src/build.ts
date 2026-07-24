import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { Post, SiteConfig } from "./types.js";
import { parsePost } from "./post.js";
import {
  renderFeed,
  renderIndex,
  renderPost,
  renderTagIndex,
  renderTagPage,
} from "./templates.js";
import { slugify } from "./util.js";

/** Recursively collect markdown files under `dir`. */
async function collectMarkdown(dir: string): Promise<string[]> {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectMarkdown(full)));
    } else if (/\.m(?:d|arkdown)$/i.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

/** Write `content` to `outDir/relPath`, creating parent directories as needed. */
async function emit(
  outDir: string,
  relPath: string,
  content: string,
): Promise<void> {
  const dest = join(outDir, relPath);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, content, "utf8");
}

/** Result summary returned from a build. */
export interface BuildResult {
  postCount: number;
  draftCount: number;
  tagCount: number;
  outDir: string;
}

/** Run a full build: parse posts, render pages, copy assets, write feed. */
export async function build(
  rootDir: string,
  config: SiteConfig,
): Promise<BuildResult> {
  const contentDir = resolve(rootDir, config.contentDir);
  const outDir = resolve(rootDir, config.outDir);

  // Fresh output directory each build.
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  // Parse every markdown file.
  const files = await collectMarkdown(contentDir);
  const parsed = await Promise.all(files.map((f) => parsePost(f, config)));

  const draftCount = parsed.filter((p) => p.draft).length;
  const posts = parsed
    .filter((p) => config.includeDrafts || !p.draft)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  ensureUniqueSlugs(posts);

  // Home page + individual posts.
  await emit(outDir, "index.html", renderIndex(config, posts));
  for (const post of posts) {
    await emit(outDir, post.outputPath, renderPost(config, post));
  }

  // Tag pages.
  const tagCounts = new Map<string, number>();
  const tagPosts = new Map<string, Post[]>();
  for (const post of posts) {
    for (const tag of post.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      const bucket = tagPosts.get(tag) ?? [];
      bucket.push(post);
      tagPosts.set(tag, bucket);
    }
  }
  await emit(outDir, "tags/index.html", renderTagIndex(config, tagCounts));
  for (const [tag, tagged] of tagPosts) {
    await emit(
      outDir,
      `tags/${slugify(tag)}.html`,
      renderTagPage(config, tag, tagged),
    );
  }

  // RSS feed.
  await emit(outDir, "feed.xml", renderFeed(config, posts));

  // Static assets (copied verbatim, overwriting generated files if named alike).
  const publicDir = resolve(rootDir, config.publicDir);
  if (existsSync(publicDir)) {
    await cp(publicDir, outDir, { recursive: true });
  }

  return {
    postCount: posts.length,
    draftCount,
    tagCount: tagCounts.size,
    outDir,
  };
}

/** Guarantee slugs are unique by suffixing collisions with -2, -3, … */
function ensureUniqueSlugs(posts: Post[]): void {
  const used = new Map<string, number>();
  for (const post of posts) {
    const base = post.slug;
    const seen = used.get(base) ?? 0;
    if (seen > 0) {
      post.slug = `${base}-${seen + 1}`;
      post.outputPath = `posts/${post.slug}.html`;
    }
    used.set(base, seen + 1);
  }
}
