# AGENTS.md - VIBELAND Coding Guide

## Build/Run Commands
- **Start server**: `bun server.js` or `bun run server.js`
- **Development server**: Runs on port 3000 at http://localhost:3000
- **Build pages**: `bun build.js` (updates index.html with page links)
- **Watch mode**: `bun build.js --watch` (auto-rebuild on page changes)
- **Database**: SQLite database at `vibeland.db` with migrations

## Architecture & Structure
- Bun.js static file server with SQLite database and guestbook functionality
- **Main entry**: `server.js` - HTTP routing, file serving, guestbook API
- **Database**: SQLite with migrations in `/migration` directory
- **Frontend**: Vanilla HTML/CSS/JS with retro 90s styling theme
- **Pages**: `/pages` directory (calculator, particles, tuner, unix-time, vibration, weather, world-clock)
- **Assets**: `/assets/styles.css` for shared styling
- **Build system**: `build.js` auto-generates page navigation in index.html

## Code Style Guidelines
- **Server-side**: Modern ES6+ JavaScript with Bun runtime
- **Frontend**: Vanilla JavaScript, no transpilation
- **Imports**: Use ES6 `import` syntax (server), script tags for browser
- **Database**: Raw SQL with prepared statements for security
- **Styling**: Inline CSS in HTML files, retro 90s aesthetic maintained
- **Naming**: camelCase for variables/functions, lowercase for files
- **Error handling**: Try-catch blocks, return appropriate HTTP status codes
- **Security**: HTML escaping for user input, whitelisted routes
