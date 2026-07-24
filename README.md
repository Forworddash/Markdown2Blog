# Markdown2Blog

A tiny markdown-to-blog static site generator written in TypeScript. Drop
markdown files in `content/`, run one command, and get a fast static site with
post pages, tag pages, and an RSS feed.

## Quick start

```bash
npm install        # install dependencies
npm run build      # compile the TypeScript generator
npm run generate   # build the site into ./site
npm run serve      # build, then serve at http://localhost:8080
```

Open <http://localhost:8080> to preview.

## Writing posts

Every `.md` file under `content/` becomes a post. Add frontmatter at the top:

```markdown
---
title: My First Post
date: 2026-07-23
description: A short summary used in listings and the RSS feed.
tags: [example, notes]
author: Sam        # optional, defaults to the site author
draft: false       # optional, drafts are excluded unless --drafts is passed
---

Write the body in standard **GitHub-flavored markdown**.
```

Anything omitted is derived: the title falls back to the filename, the excerpt
to the first paragraph, and the slug to a URL-safe version of the title.

## Configuration

`site.config.json` at the project root controls the site:

| Key             | Meaning                                             |
| --------------- | --------------------------------------------------- |
| `title`         | Blog title, shown in the header and page titles     |
| `description`   | Site tagline / meta description                      |
| `url`           | Absolute base URL (used for RSS + canonical links)  |
| `author`        | Default author name                                  |
| `contentDir`    | Where markdown posts live (default `content`)        |
| `publicDir`     | Static assets copied verbatim (default `public`)     |
| `outDir`        | Output directory (default `site`)                    |
| `includeDrafts` | Include `draft: true` posts (default `false`)        |

## CLI

```
md2blog build [options]     Generate the site into the output directory
md2blog serve [options]     Build, then serve the site locally
md2blog help                Show help

Options:
  --root <dir>   Project root (default: current directory)
  --drafts       Include posts marked "draft: true"
  --port <n>     Port for 'serve' (default: 8080)
```

## What gets generated

```
site/
├── index.html                 # home page, posts newest-first
├── posts/<slug>.html          # one page per post
├── tags/index.html            # all tags with counts
├── tags/<tag>.html            # posts for each tag
├── feed.xml                   # RSS 2.0 feed
└── styles.css                 # copied from public/
```

The output is plain static files — host them on GitHub Pages, Netlify, S3, or
any static host.

## Project layout

```
src/
├── cli.ts        # command-line entry point
├── build.ts      # orchestrates a full build
├── post.ts       # markdown + frontmatter parsing
├── templates.ts  # HTML/RSS templates
├── server.ts     # local static dev server
├── config.ts     # config loading + defaults
├── types.ts      # shared types
└── util.ts       # slugify, escaping, dates, reading time
```
