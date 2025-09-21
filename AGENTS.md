# AGENTS.md - VIBELAND Coding Guide

## Build/Run Commands
- **Start server**: `bun server.js` or `bun run server.js`
- **Development server**: Runs on port 3000 at http://localhost:3000
- No build process - static files served directly

## Architecture & Structure
- Simple Bun.js static file server with basic routing
- Main entry point: `server.js` - handles all HTTP requests and file serving
- Frontend: Vanilla HTML/CSS/JS with retro 90s styling theme
- Pages stored in `pages/` directory (currently: `particles.html` with canvas-based particle simulator)
- No database, no external APIs, no frameworks

## Code Style Guidelines
- **Server-side**: Modern ES6+ JavaScript with Bun runtime
- **Frontend**: Vanilla JavaScript, no transpilation
- **Imports**: Use ES6 `import` syntax (server), script tags for browser
- **Styling**: Inline CSS in HTML files, retro 90s aesthetic maintained
- **Naming**: camelCase for variables/functions, lowercase for files
- **Error handling**: Try-catch blocks, return appropriate HTTP status codes
- **File structure**: Flat structure, pages in `/pages` directory
