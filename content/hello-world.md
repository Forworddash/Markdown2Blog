---
title: Hello, World
date: 2026-07-20
description: The first post — a quick tour of what Markdown2Blog can do.
tags: [meta, getting-started]
---

Welcome to **Markdown2Blog**. Every file in the `content/` directory becomes a
post, and this paragraph becomes the excerpt on the home page.

## Writing posts

Posts are plain markdown with a small block of frontmatter at the top:

```yaml
---
title: My Post
date: 2026-07-20
tags: [example]
---
```

Everything below the frontmatter is standard GitHub-flavored markdown:

- Lists, **bold**, _italic_, and `inline code`
- [Links](https://example.com)
- Code blocks with fences
- > Blockquotes

| Feature      | Supported |
| ------------ | --------- |
| Tag pages    | Yes       |
| RSS feed     | Yes       |
| Drafts       | Yes       |

## What gets generated

Running `md2blog build` produces a static `site/` directory containing the home
page, one HTML file per post, tag pages, and an RSS feed. Point any static host
at it and you're done.
