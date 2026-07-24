import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import type { Post, PostFrontmatter, SiteConfig } from "./types.js";
import { readingTime, slugify } from "./util.js";

marked.setOptions({
  gfm: true,
  breaks: false,
});

/**
 * Parse a single markdown file into a {@link Post}.
 * `filePath` is used to derive a fallback slug and title.
 */
export async function parsePost(
  filePath: string,
  config: SiteConfig,
): Promise<Post> {
  const raw = await readFile(filePath, "utf8");
  const { data, content } = matter(raw);
  const fm = data as PostFrontmatter;

  const fileStem = basename(filePath).replace(/\.m(?:d|arkdown)$/i, "");
  const title = fm.title?.trim() || humanize(fileStem);
  const slug = fm.title ? slugify(fm.title) : slugify(fileStem);

  const date = parseDate(fm.date);
  const html = await marked.parse(content);
  const tags = normalizeTags(fm.tags);

  return {
    slug,
    title,
    date,
    description: fm.description?.trim() || deriveExcerpt(content),
    tags,
    author: fm.author?.trim() || config.author,
    draft: fm.draft === true,
    html,
    readingMinutes: readingTime(content),
    outputPath: `posts/${slug}.html`,
  };
}

/** Turn a file stem like "hello-world" into "Hello World". */
function humanize(stem: string): string {
  return stem
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Parse a frontmatter date; fall back to the epoch-safe "now" if absent/invalid. */
function parseDate(value: string | undefined): Date {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

/** Accept a comma string or array of tags; return a clean, de-duplicated list. */
function normalizeTags(value: unknown): string[] {
  let list: string[];
  if (Array.isArray(value)) {
    list = value.map((t) => String(t));
  } else if (typeof value === "string") {
    list = value.split(",");
  } else {
    return [];
  }
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tag of list) {
    const trimmed = tag.trim();
    if (trimmed && !seen.has(trimmed.toLowerCase())) {
      seen.add(trimmed.toLowerCase());
      out.push(trimmed);
    }
  }
  return out;
}

/** Build a short plain-text excerpt from the first paragraph of markdown. */
function deriveExcerpt(markdown: string): string {
  const firstPara =
    markdown
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .find((p) => p && !p.startsWith("#")) ?? "";
  const plain = firstPara
    .replace(/[#>*_`~\-]/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> text
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > 160 ? `${plain.slice(0, 157)}…` : plain;
}
