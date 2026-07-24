import type { Post, SiteConfig } from "./types.js";
import { escapeHtml, formatDate, isoDate, slugify } from "./util.js";

/** Wrap page `body` in the shared HTML shell. */
function layout(
  config: SiteConfig,
  opts: { title: string; description: string; body: string; canonical?: string },
): string {
  const pageTitle =
    opts.title === config.title
      ? config.title
      : `${opts.title} · ${config.title}`;
  const canonical = opts.canonical
    ? `<link rel="canonical" href="${escapeHtml(opts.canonical)}">`
    : "";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(opts.description)}">
  <link rel="stylesheet" href="/styles.css">
  <link rel="alternate" type="application/rss+xml" title="${escapeHtml(config.title)}" href="/feed.xml">
  ${canonical}
</head>
<body>
  <header class="site-header">
    <a class="site-title" href="/">${escapeHtml(config.title)}</a>
    <nav class="site-nav">
      <a href="/">Posts</a>
      <a href="/tags/">Tags</a>
      <a href="/feed.xml">RSS</a>
    </nav>
  </header>
  <main class="container">
${opts.body}
  </main>
  <footer class="site-footer">
    <p>&copy; ${new Date().getUTCFullYear()} ${escapeHtml(config.author)} · Built with Markdown2Blog</p>
  </footer>
</body>
</html>
`;
}

/** A compact card summarising a post, used in listings. */
function postCard(post: Post): string {
  const tags = post.tags
    .map(
      (t) =>
        `<a class="tag" href="/tags/${slugify(t)}.html">${escapeHtml(t)}</a>`,
    )
    .join("");
  return `    <article class="post-card">
      <h2><a href="/${post.outputPath}">${escapeHtml(post.title)}</a></h2>
      <p class="post-meta">
        <time datetime="${isoDate(post.date)}">${formatDate(post.date)}</time>
        · ${post.readingMinutes} min read
      </p>
      <p class="post-excerpt">${escapeHtml(post.description)}</p>
      <div class="tags">${tags}</div>
    </article>`;
}

/** Home page: reverse-chronological list of posts. */
export function renderIndex(config: SiteConfig, posts: Post[]): string {
  const cards = posts.map(postCard).join("\n");
  const body = `    <section class="intro">
      <p>${escapeHtml(config.description)}</p>
    </section>
    <section class="post-list">
${cards || "      <p>No posts yet.</p>"}
    </section>`;
  return layout(config, {
    title: config.title,
    description: config.description,
    body,
  });
}

/** A single post page. */
export function renderPost(config: SiteConfig, post: Post): string {
  const tags = post.tags
    .map(
      (t) =>
        `<a class="tag" href="/tags/${slugify(t)}.html">${escapeHtml(t)}</a>`,
    )
    .join("");
  const body = `    <article class="post">
      <header class="post-header">
        <h1>${escapeHtml(post.title)}</h1>
        <p class="post-meta">
          <time datetime="${isoDate(post.date)}">${formatDate(post.date)}</time>
          · ${post.readingMinutes} min read · ${escapeHtml(post.author)}
        </p>
        <div class="tags">${tags}</div>
      </header>
      <div class="post-body">
${post.html}
      </div>
      <p class="back"><a href="/">← All posts</a></p>
    </article>`;
  return layout(config, {
    title: post.title,
    description: post.description,
    body,
    canonical: `${config.url}/${post.outputPath}`,
  });
}

/** Index of all tags with counts. */
export function renderTagIndex(
  config: SiteConfig,
  tagCounts: Map<string, number>,
): string {
  const items = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(
      ([tag, count]) =>
        `      <li><a class="tag" href="/tags/${slugify(tag)}.html">${escapeHtml(tag)}</a> <span class="count">${count}</span></li>`,
    )
    .join("\n");
  const body = `    <h1>Tags</h1>
    <ul class="tag-index">
${items || "      <li>No tags yet.</li>"}
    </ul>`;
  return layout(config, {
    title: "Tags",
    description: `All tags on ${config.title}`,
    body,
  });
}

/** A page listing every post carrying a given tag. */
export function renderTagPage(
  config: SiteConfig,
  tag: string,
  posts: Post[],
): string {
  const cards = posts.map(postCard).join("\n");
  const body = `    <h1>Posts tagged &ldquo;${escapeHtml(tag)}&rdquo;</h1>
    <p><a href="/tags/">← All tags</a></p>
    <section class="post-list">
${cards}
    </section>`;
  return layout(config, {
    title: `Tag: ${tag}`,
    description: `Posts tagged ${tag} on ${config.title}`,
    body,
  });
}

/** RSS 2.0 feed. */
export function renderFeed(config: SiteConfig, posts: Post[]): string {
  const items = posts
    .slice(0, 20)
    .map((post) => {
      const link = `${config.url}/${post.outputPath}`;
      return `    <item>
      <title>${escapeHtml(post.title)}</title>
      <link>${escapeHtml(link)}</link>
      <guid>${escapeHtml(link)}</guid>
      <pubDate>${post.date.toUTCString()}</pubDate>
      <description>${escapeHtml(post.description)}</description>
    </item>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeHtml(config.title)}</title>
    <link>${escapeHtml(config.url)}</link>
    <description>${escapeHtml(config.description)}</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;
}
