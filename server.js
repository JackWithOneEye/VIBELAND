import { serve } from "bun";
import { file } from "bun";
import { Database } from "bun:sqlite";

// Initialize SQLite database
const db = new Database("guestbook.db", { create: true });

// Create guest book table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

function generateGuestbookHTML(entries, hasError, hasSuccess, locale = 'en-US', timezone = 'UTC') {
  const entriesHTML = entries.length === 0
    ? '<div class="loading-message">No entries yet. Be the first to sign!</div>'
    : entries.map(entry => {
      const formatter = new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const date = formatter.format(new Date(entry.timestamp + 'Z'));
      return `
          <div class="entry">
            <div class="entry-header">
              <span class="entry-name">${escapeHtml(entry.name)}</span>
              <span class="entry-date">${date}</span>
            </div>
            <div class="entry-message">${escapeHtml(entry.message)}</div>
          </div>
        `;
    }).join('');

  const errorMessage = hasError ? '<div class="error" style="color: #ff0000; padding: 10px; margin: 10px 0; text-align: center;">Please fill in both name and message fields.</div>' : '';
  const successMessage = hasSuccess ? '<div class="success" style="color: #008000; padding: 10px; margin: 10px 0; text-align: center;">Your entry has been added to the guest book!</div>' : '';

  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>Guest Book - VIBELAND</title>
  <link rel="stylesheet" type="text/css" href="assets/styles.css">
  <style>
    .guestbook-form {
      background-color: #ffffff;
      border: 2px inset #c0c0c0;
      padding: 20px;
      margin: 20px 0;
    }
    
    .form-group {
      margin-bottom: 15px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 5px;
      color: #000080;
      font-weight: bold;
    }
    
    .form-group input[type="text"],
    .form-group textarea {
      width: 100%;
      padding: 8px;
      border: 2px inset #c0c0c0;
      background-color: #ffffff;
      color: #000000;
      font-family: "Times New Roman", serif;
      box-sizing: border-box;
    }
    
    .form-group textarea {
      height: 80px;
      resize: vertical;
    }
    
    .submit-btn {
      background-color: #000080;
      color: #ffffff;
      border: 2px outset #000080;
      padding: 10px 20px;
      cursor: pointer;
      font-family: "Times New Roman", serif;
      font-weight: bold;
    }
    
    .submit-btn:active {
      border: 2px inset #000080;
      background-color: #000060;
    }
    
    .entries {
      background-color: #ffffff;
      border: 2px inset #c0c0c0;
      padding: 20px;
      margin: 20px 0;
      max-height: 400px;
      overflow-y: auto;
    }
    
    .entry {
      border-bottom: 1px solid #c0c0c0;
      padding: 15px 0;
      margin-bottom: 15px;
    }
    
    .entry:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }
    
    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .entry-name {
      font-weight: bold;
      color: #000080;
    }
    
    .entry-date {
      font-size: 12px;
      color: #808080;
      font-style: italic;
    }
    
    .entry-message {
      color: #000000;
      line-height: 1.4;
      word-wrap: break-word;
    }
    
    .loading-message {
      text-align: center;
      color: #000080;
      font-style: italic;
      padding: 20px;
    }
  </style>
</head>

<body>
  <div class="container">
    <h1>VIBELAND Guest Book</h1>
    
    <p><a href="/" class="home-link">← Back to VIBELAND</a></p>

    <h2>Sign the Guest Book</h2>
    <div class="guestbook-form">
      ${errorMessage}
      ${successMessage}
      <form method="POST" action="/guestbook.html">
        <div class="form-group">
          <label for="name">Name:</label>
          <input type="text" id="name" name="name" required maxlength="50">
        </div>
        <div class="form-group">
          <label for="message">Message:</label>
          <textarea id="message" name="message" required maxlength="500" placeholder="Leave your mark on VIBELAND..."></textarea>
        </div>
        <button type="submit" class="submit-btn">Sign Guest Book</button>
      </form>
    </div>

    <h2>Guest Book Entries</h2>
    <div class="entries" id="entries">
      ${entriesHTML}
    </div>

    <div class="footer">
      <p>© 1999 VIBELAND - All Rights Reserved</p>
    </div>
  </div>

  <script>
    // Detect user timezone and reload with timezone parameter
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const urlParams = new URLSearchParams(window.location.search);
    
    if (!urlParams.has('tz') && userTimezone) {
      urlParams.set('tz', userTimezone);
      const newUrl = window.location.pathname + '?' + urlParams.toString();
      if (newUrl !== window.location.href) {
        window.location.replace(newUrl);
      }
    }
  </script>
</body>

</html>`;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}

serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = url.pathname;

    // Handle guest book routes
    if (pathname === "/guestbook.html") {
      if (req.method === "POST") {
        // Handle form submission
        const formData = await req.formData();
        const name = formData.get("name");
        const message = formData.get("message");

        if (!name || !message) {
          return Response.redirect(url.origin + "/guestbook.html?error=missing", 302);
        }

        db.prepare("INSERT INTO entries (name, message) VALUES (?, ?)").run(name, message);
        return Response.redirect(url.origin + "/guestbook.html?success=1", 302);
      } else {
        // Serve dynamic guestbook page
        const entries = db.prepare("SELECT * FROM entries ORDER BY timestamp DESC").all();
        const hasError = url.searchParams.has("error");
        const hasSuccess = url.searchParams.has("success");

        // Extract locale from Accept-Language header with en-US fallback
        const acceptLanguage = req.headers.get('Accept-Language') || 'en-US';
        const locale = acceptLanguage.split(',')[0].split(';')[0] || 'en-US';

        // Extract timezone from URL parameter with UTC fallback
        const timezone = decodeURIComponent(url.searchParams.get('tz') || 'UTC');

        const html = generateGuestbookHTML(entries, hasError, hasSuccess, locale, timezone);
        return new Response(html, {
          headers: { "Content-Type": "text/html" }
        });
      }
    }



    // Default to index.html for root path
    if (pathname === "/") {
      pathname = "/index.html";
    }

    // Construct file path
    const filePath = `.${pathname}`;

    try {
      const fileContent = file(filePath);

      // Check if file exists
      if (!(await fileContent.exists())) {
        return new Response("Not Found", { status: 404 });
      }

      // Determine content type
      let contentType = "text/html";
      if (pathname.endsWith(".css")) {
        contentType = "text/css";
      } else if (pathname.endsWith(".js")) {
        contentType = "application/javascript";
      } else if (pathname.endsWith(".png")) {
        contentType = "image/png";
      } else if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) {
        contentType = "image/jpeg";
      } else if (pathname.endsWith(".gif")) {
        contentType = "image/gif";
      }

      return new Response(fileContent, {
        headers: { "Content-Type": contentType }
      });

    } catch (error) {
      return new Response("Internal Server Error", { status: 500 });
    }
  }
});

console.log("🌟 VIBELAND server is running on http://localhost:3000");
