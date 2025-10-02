# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **dependency-free static site generator** for the PR Podcast website. The project uses pure JavaScript/Node.js with no external npm dependencies and implements a custom template engine.

## Commands

### Build and Development
- `./build.sh` - Generate the static website in `docs/` directory
- `./build.sh serve` - Build, serve at http://localhost:8080, and watch for changes
- `./build.sh test` - Run the test suite

### Requirements
- Only Node.js is required - no `npm install` needed

## Architecture

### Core Components

**Template Engine** (`src/templates.js`):
- `TemplateEngine` class handles page rendering with custom template syntax
- `PostEngine` extends TemplateEngine to handle blog posts with layouts
- Template syntax: JS code lines start with `%`, literals use `${}`
- Supports `% include filename.html` directive for partials

**Generation System** (`src/generate.js`):
- Entry point for processing pages and posts
- Handles post caching in `.posts_cache.json`
- Processes posts chronologically and makes them available to pages

**Post Processing** (`src/post.js`):
- Parses front-matter from Markdown files
- Basic Markdown-to-HTML conversion (limited implementation)
- Extracts publish dates from filenames (`YYYY-MM-DD-title.md`)

### Directory Structure

**Site Content** (`site/`):
- `content/` - Markdown posts with format `YYYY-MM-DD-title.md`
- `statics/` - Static files and page templates (gets processed)
- `layout/` - HTML layout templates for posts
- `include/` - Partial HTML files for includes
- `configs.json` - Site configuration (title, URLs, etc.)

**Generated Output** (`docs/`):
- Built site output directory
- Committed to repo for GitHub Pages hosting

### Template Variables

**All Pages/Posts**:
- `site.*` - All values from `configs.json`
- Access via `${ site.title }`, `${ site.url }`, etc.

**Pages Only**:
- `posts` - Array of all post data, sorted by date (newest first)

**Posts Only**:
- `post.*` - Front-matter data from the post
- `content` - Rendered post HTML content
- `url` - Post's relative URL
- `publishDate` - Date extracted from filename

## Development Notes

- Posts are cached for performance - delete `.posts_cache.json` to rebuild all
- ASCII files in `statics/` are processed as templates, others are copied as-is
- Build process: posts first, then pages (so pages can access post data)
- Watch mode checks for file changes every 2 seconds
- Custom template engine uses `Function()` constructor for JS evaluation