# AGENTS.md - VIBELAND Project Guide

## Commands

- **Build**: `bun build.js` - Updates index.html with links to all HTML pages in /pages
- **Build (watch mode)**: `bun build.js --watch` - Watches /pages directory and rebuilds on changes
- **Start server**: `bun server.js` - Starts server on <http://localhost:3000>
- **No test suite**: This project has no automated tests

## Architecture

- **Runtime**: Bun-based web server with static HTML pages
- **Server**: server.js - Bun.serve() with route handlers; handles /guestbook with dynamic HTML generation
- **Database**: SQLite (vibeland.db) managed via bun:sqlite, used for guestbook entries
- **Migrations**: migration/ directory - Sequential numbered migrations (001_initial_schema.js, etc.), run automatically on server start
- **Frontend**: Vanilla HTML/CSS/JS with retro 90s styling theme
- **Pages**: pages/ directory - Self-contained HTML pages with inline CSS and JavaScript
- **Assets**: assets/ directory - Shared styles.css and other resources

## Code Style & Conventions

- Use **double quotes** for strings in JavaScript (not single quotes)
- HTML pages are standalone with inline `<style>` and `<script>` tags
- Inline CSS in HTML files, retro 90s aesthetic maintained
- Database queries use prepared statements: `db.prepare("SQL").run()` or `.all()`
- Migration files export `up(db)` and `down(db)` functions
- Server routes defined in routes object with GET/POST handlers or direct file responses
- Escape user input with escapeHtml() before rendering (see server.js example)
