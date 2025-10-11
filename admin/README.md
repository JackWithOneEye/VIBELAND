# VIBELAND Admin Terminal

Terminal-based admin interface for managing VIBELAND using Charm CLI libraries.

## Prerequisites

- Go 1.21 or higher
- SQLite3

## Installation

```bash
cd admin
go build -o vibeland-admin
```

## Usage

Run the admin terminal:

```bash
./vibeland-admin
```

## Features

### Guestbook Inspection

Review and moderate guestbook entries:

- Lists up to 100 unreviewed entries (where `reviewed_at` is NULL)
- Navigate with arrow keys or j/k (vim-style)
- Mark entries:
  - `a` - Approve entry
  - `d` - Disapprove entry  
  - `c` - Clear decision
- `enter` - Submit all decisions
- `esc` - Return to main menu
- `q` - Quit (from main menu)

When submitted, entries are updated with:
- `reviewed_at` set to current timestamp
- `approved` set to 1 for approved entries, 0 for disapproved
