---
title: Why Static Sites Still Win
date: 2026-07-22
description: Static HTML is fast, cheap to host, and outlasts every framework churn.
tags: [meta, performance]
---

There is a lot to like about generating a blog ahead of time instead of
rendering it on every request.

## Speed

A pre-rendered HTML file served from a CDN is about as fast as the web gets.
There is no database round-trip, no server-side template rendering, and no cold
start — just bytes over the wire.

## Simplicity

The output is _just files_. You can host them on GitHub Pages, Netlify, S3, or a
folder behind nginx. Nothing to patch, nothing to keep running at 3am.

## Longevity

HTML written today will still open in a decade. That is hard to say about most
application stacks.
