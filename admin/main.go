package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/charmbracelet/bubbles/list"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	_ "github.com/mattn/go-sqlite3"
)

type view int

const (
	menuView view = iota
	guestbookView
)

type GuestbookEntry struct {
	ID          int
	Name        string
	Email       sql.NullString
	Message     string
	IP          sql.NullString
	UserAgent   sql.NullString
	Locale      sql.NullString
	SubmittedAt string
	ReviewedAt  sql.NullString
	Approved    int
	Decision    string
}

type model struct {
	currentView     view
	menuList        list.Model
	entries         []GuestbookEntry
	selectedIndex   int
	scrollOffset    int
	termHeight      int
	db              *sql.DB
	quitting        bool
	feedbackMsg     string
	unreviewedCount int
}

type clearFeedbackMsg struct{}

var (
	titleStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("205")).
			MarginBottom(1)

	selectedStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("170")).
			Bold(true)

	dimStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("240"))

	successStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("42"))

	errorStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("196"))

	entryBoxStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(lipgloss.Color("63")).
			Padding(0, 1).
			MarginBottom(1)

	selectedEntryBoxStyle = lipgloss.NewStyle().
				Border(lipgloss.RoundedBorder()).
				BorderForeground(lipgloss.Color("170")).
				Padding(0, 1).
				MarginBottom(1)

	labelStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("99")).
			Bold(true)

	messageStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("255")).
			Italic(true).
			Padding(1, 0, 0, 0)
)

type menuItem struct {
	title string
}

func (i menuItem) Title() string       { return i.title }
func (i menuItem) Description() string { return "" }
func (i menuItem) FilterValue() string { return i.title }

func initialModel(db *sql.DB) model {
	unreviewedCount := getUnreviewedCount(db)

	items := []list.Item{
		menuItem{title: fmt.Sprintf("Guestbook Inspection (%d)", unreviewedCount)},
	}

	menuList := list.New(items, list.NewDefaultDelegate(), 0, 0)
	menuList.Title = "VIBELAND Admin Terminal"
	menuList.SetShowStatusBar(false)
	menuList.SetFilteringEnabled(false)
	menuList.SetShowHelp(false)

	return model{
		currentView:     menuView,
		menuList:        menuList,
		db:              db,
		unreviewedCount: unreviewedCount,
	}
}

func (m model) Init() tea.Cmd {
	return nil
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case reviewSubmittedMsg:
		m.entries = msg.entries
		m.selectedIndex = 0
		m.scrollOffset = 0
		if msg.count > 0 {
			m.feedbackMsg = fmt.Sprintf("✓ Reviewed %d %s", msg.count, map[bool]string{true: "entry", false: "entries"}[msg.count == 1])
			return m, tea.Tick(2*time.Second, func(t time.Time) tea.Msg {
				return clearFeedbackMsg{}
			})
		}
		return m, nil

	case clearFeedbackMsg:
		m.feedbackMsg = ""
		return m, nil

	case tea.WindowSizeMsg:
		m.menuList.SetSize(msg.Width, msg.Height)
		m.termHeight = msg.Height
		return m, nil

	case tea.KeyMsg:
		switch msg.String() {
		case "ctrl+c", "q":
			if m.currentView == menuView {
				m.quitting = true
				return m, tea.Quit
			}

		case "esc":
			if m.currentView == guestbookView {
				m.currentView = menuView
				m.unreviewedCount = getUnreviewedCount(m.db)
				m.menuList.SetItem(0, menuItem{title: fmt.Sprintf("Guestbook Inspection (%d)", m.unreviewedCount)})
				return m, nil
			}

		case "enter":
			if m.currentView == menuView {
				if selectedItem, ok := m.menuList.SelectedItem().(menuItem); ok {
					if len(selectedItem.title) >= 21 && selectedItem.title[:21] == "Guestbook Inspection " {
						entries, err := loadUnreviewedEntries(m.db)
						if err != nil {
							log.Fatal(err)
						}
						m.entries = entries
						m.selectedIndex = 0
						m.scrollOffset = 0
						m.currentView = guestbookView
						return m, nil
					}
				}
			} else if m.currentView == guestbookView {
				return m, m.submitReviews()
			}

		case "up", "k":
			if m.currentView == guestbookView && m.selectedIndex > 0 {
				m.selectedIndex--
				if m.selectedIndex < m.scrollOffset {
					m.scrollOffset = m.selectedIndex
				}
			}

		case "down", "j":
			if m.currentView == guestbookView && m.selectedIndex < len(m.entries)-1 {
				m.selectedIndex++
				entriesPerPage := m.getVisibleEntries()
				if m.selectedIndex >= m.scrollOffset+entriesPerPage {
					m.scrollOffset = m.selectedIndex - entriesPerPage + 1
				}
			}

		case "a":
			if m.currentView == guestbookView && len(m.entries) > 0 {
				m.entries[m.selectedIndex].Decision = "approved"
			}

		case "d":
			if m.currentView == guestbookView && len(m.entries) > 0 {
				m.entries[m.selectedIndex].Decision = "disapproved"
			}

		case "c":
			if m.currentView == guestbookView && len(m.entries) > 0 {
				m.entries[m.selectedIndex].Decision = ""
			}
		}
	}

	if m.currentView == menuView {
		var cmd tea.Cmd
		m.menuList, cmd = m.menuList.Update(msg)
		return m, cmd
	}

	return m, nil
}

func (m model) getVisibleEntries() int {
	linesPerEntry := 13
	headerLines := 5
	controlsLines := 2
	availableLines := m.termHeight - headerLines - controlsLines
	if availableLines < linesPerEntry {
		return 1
	}
	return availableLines / linesPerEntry
}

func (m model) View() string {
	if m.quitting {
		return "Goodbye!\n"
	}

	switch m.currentView {
	case menuView:
		return m.menuList.View()

	case guestbookView:
		return m.renderGuestbookView()

	default:
		return ""
	}
}

func (m model) renderGuestbookView() string {
	s := titleStyle.Render("Guestbook Inspection") + "\n\n"

	if m.feedbackMsg != "" {
		s += successStyle.Render(m.feedbackMsg) + "\n\n"
	}

	if len(m.entries) == 0 {
		s += dimStyle.Render("No unreviewed entries.") + "\n\n"
		s += dimStyle.Render("Press ESC to return to menu") + "\n"
		return s
	}

	entriesPerPage := m.getVisibleEntries()
	endIndex := m.scrollOffset + entriesPerPage
	if endIndex > len(m.entries) {
		endIndex = len(m.entries)
	}

	for i := m.scrollOffset; i < endIndex; i++ {
		entry := m.entries[i]
		isSelected := i == m.selectedIndex
		boxStyle := entryBoxStyle
		if isSelected {
			boxStyle = selectedEntryBoxStyle
		}

		status := dimStyle.Render("⊙ undecided")
		switch entry.Decision {
		case "approved":
			status = successStyle.Render("✓ APPROVED")
		case "disapproved":
			status = errorStyle.Render("✗ DISAPPROVED")
		}

		emailStr := dimStyle.Render("none")
		if entry.Email.Valid {
			emailStr = entry.Email.String
		}
		ipStr := dimStyle.Render("unknown")
		if entry.IP.Valid {
			ipStr = entry.IP.String
		}
		localeStr := dimStyle.Render("unknown")
		if entry.Locale.Valid {
			localeStr = entry.Locale.String
		}
		uaStr := dimStyle.Render("unknown")
		if entry.UserAgent.Valid {
			uaStr = entry.UserAgent.String
		}

		content := fmt.Sprintf("%s %s\n\n", labelStyle.Render(fmt.Sprintf("Entry #%d", entry.ID)), status)
		content += fmt.Sprintf("%s %s\n", labelStyle.Render("Name:"), entry.Name)
		content += fmt.Sprintf("%s %s\n", labelStyle.Render("Email:"), emailStr)
		content += fmt.Sprintf("%s %s\n", labelStyle.Render("Submitted:"), dimStyle.Render(entry.SubmittedAt))
		content += fmt.Sprintf("%s %s\n", labelStyle.Render("IP Address:"), ipStr)
		content += fmt.Sprintf("%s %s\n", labelStyle.Render("Locale:"), localeStr)
		content += fmt.Sprintf("%s %s", labelStyle.Render("User-Agent:"), uaStr)
		content += messageStyle.Render(fmt.Sprintf("\n%s %s", labelStyle.Render("Message:"), entry.Message))

		s += boxStyle.Render(content) + "\n"
	}

	s += dimStyle.Render("Controls: ↑/k up | ↓/j down | a approve | d disapprove | c clear | enter submit | esc back") + "\n"

	return s
}

type reviewSubmittedMsg struct {
	count   int
	entries []GuestbookEntry
}

func (m model) submitReviews() tea.Cmd {
	return func() tea.Msg {
		now := time.Now().Format("2006-01-02 15:04:05")
		reviewedCount := 0

		for _, entry := range m.entries {
			if entry.Decision == "" {
				continue
			}

			approved := 0
			if entry.Decision == "approved" {
				approved = 1
			}

			_, err := m.db.Exec(
				"UPDATE guestbook SET reviewed_at = ?, approved = ? WHERE id = ?",
				now, approved, entry.ID,
			)
			if err != nil {
				log.Printf("Error updating entry %d: %v", entry.ID, err)
			} else {
				reviewedCount++
			}
		}

		entries, err := loadUnreviewedEntries(m.db)
		if err != nil {
			log.Fatal(err)
		}

		return reviewSubmittedMsg{
			count:   reviewedCount,
			entries: entries,
		}
	}
}

func getUnreviewedCount(db *sql.DB) int {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM guestbook WHERE reviewed_at IS NULL").Scan(&count)
	if err != nil {
		log.Printf("Error getting unreviewed count: %v", err)
		return 0
	}
	return count
}

func loadUnreviewedEntries(db *sql.DB) ([]GuestbookEntry, error) {
	rows, err := db.Query(`
		SELECT g.id, g.name, g.email, g.message, g.ip, ua.value, g.locale, g.submitted_at, g.reviewed_at, g.approved 
		FROM guestbook g
		LEFT JOIN user_agent ua ON g.user_agent_id = ua.id
		WHERE g.reviewed_at IS NULL 
		ORDER BY g.submitted_at ASC 
		LIMIT 100
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []GuestbookEntry
	for rows.Next() {
		var entry GuestbookEntry
		err := rows.Scan(&entry.ID, &entry.Name, &entry.Email, &entry.Message, &entry.IP, &entry.UserAgent, &entry.Locale, &entry.SubmittedAt, &entry.ReviewedAt, &entry.Approved)
		if err != nil {
			return nil, err
		}
		entries = append(entries, entry)
	}

	return entries, nil
}

func main() {
	dbPath := "../vibeland.db"
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	p := tea.NewProgram(initialModel(db), tea.WithAltScreen())
	if _, err := p.Run(); err != nil {
		fmt.Printf("Error: %v", err)
		os.Exit(1)
	}
}
