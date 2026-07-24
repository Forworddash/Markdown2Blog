/** Shared types for the generator. */

/** Site-wide configuration, loaded from `site.config.json`. */
export interface SiteConfig {
  /** Blog title, shown in the header and page titles. */
  title: string;
  /** Short tagline / meta description for the site. */
  description: string;
  /** Absolute base URL, e.g. "https://example.com". Used for RSS + canonical links. No trailing slash. */
  url: string;
  /** Default author name. */
  author: string;
  /** Directory holding markdown posts (relative to project root). */
  contentDir: string;
  /** Directory of static assets copied verbatim into the output. */
  publicDir: string;
  /** Output directory for the generated site. */
  outDir: string;
  /** When false, posts with `draft: true` are excluded from the build. */
  includeDrafts: boolean;
}

/** Frontmatter fields recognised on a post. All optional except what we can derive. */
export interface PostFrontmatter {
  title?: string;
  date?: string;
  description?: string;
  tags?: string[];
  author?: string;
  draft?: boolean;
}

/** A fully-parsed post, ready to render. */
export interface Post {
  /** URL-safe identifier derived from the filename or frontmatter. */
  slug: string;
  title: string;
  /** Parsed publication date. */
  date: Date;
  description: string;
  tags: string[];
  author: string;
  draft: boolean;
  /** Rendered HTML body (markdown already converted). */
  html: string;
  /** Estimated reading time in minutes. */
  readingMinutes: number;
  /** Output path relative to the site root, e.g. "posts/hello-world.html". */
  outputPath: string;
}
