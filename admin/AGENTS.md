# AGENTS.md - VIBELAND Admin Terminal

## Commands
- **Build**: `go build -o vibeland-admin`
- **Run**: `./vibeland-admin`
- **Test**: No test suite currently exists
- **Format**: `go fmt ./...`
- **Vet**: `go vet ./...`

## Architecture
- **Type**: Terminal UI (TUI) application using Charm Bubble Tea framework
- **Database**: SQLite3 at `../vibeland.db` (one directory up from admin/)
- **Main components**: Model-View-Update pattern with two views (menuView, guestbookView)
- **Key dependencies**: charmbracelet/bubbletea (TUI), charmbracelet/lipgloss (styling), mattn/go-sqlite3 (database)

## Code Style & Conventions
- **Imports**: Standard library first, then third-party (blank imports for drivers like sqlite3)
- **Types**: Use explicit struct types; constants with iota for enums (e.g., `type view int`)
- **Naming**: camelCase for unexported, PascalCase for exported; descriptive names (e.g., `GuestbookEntry`, `selectedIndex`)
- **Styling**: lipgloss.NewStyle() with method chaining; define global style variables
- **Error handling**: Check all errors; use log.Fatal for initialization errors, log.Printf for runtime errors
- **SQL**: Use parameterized queries with db.Exec() and db.Query() to prevent SQL injection
- **Database fields**: Handle nullable fields with sql.NullString, sql.NullInt64, etc.
