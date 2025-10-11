import { runMigrations } from "./migration/migrate.js";

// Initialize database with migrations
const db = await runMigrations();

Bun.serve({
  port: 3000,
  routes: {
    "/": Response.redirect("/home"),
    "/home": Bun.file("./index.html"),
    "/battleship": Bun.file("./pages/battleship.html"),
    "/calculator": Bun.file("./pages/calculator.html"),
    "/freecell": Bun.file("./pages/freecell.html"),
    "/mahjong": Bun.file("./pages/mahjong.html"),
    "/paint": Bun.file("./pages/paint.html"),
    "/particles": Bun.file("./pages/particles.html"),
    "/pong": Bun.file("./pages/pong.html"),
    "/solitaire": Bun.file("./pages/solitaire.html"),
    "/sudoku": Bun.file("./pages/sudoku.html"),
    "/synthesizer": Bun.file("./pages/synthesizer.html"),
    "/the-orb": Bun.file("./pages/the-orb.html"),
    "/tuner": Bun.file("./pages/tuner.html"),
    "/unix-time": Bun.file("./pages/unix-time.html"),
    "/vibration": Bun.file("./pages/vibration.html"),
    "/weather": Bun.file("./pages/weather.html"),
    "/world-clock": Bun.file("./pages/world-clock.html"),

    "/guestbook": {
      GET: async req => {
        const url = new URL(req.url);
        const entries = db.prepare("SELECT * FROM guestbook WHERE approved = 1 ORDER BY submitted_at DESC LIMIT 100").all();
        const hasSuccess = url.searchParams.has("success");

        const acceptLanguage = req.headers.get('Accept-Language') || 'en-US';
        const locale = acceptLanguage.split(',')[0].split(';')[0] || 'en-US';

        const html = await generateGuestbookViewHTML(entries, hasSuccess, locale);
        return new Response(html, {
          headers: { "Content-Type": "text/html" }
        });
      }
    },
    "/guestbook/add": {
      GET: async req => {
        const url = new URL(req.url);
        const hasError = url.searchParams.has("error");

        const html = await generateGuestbookAddHTML(hasError);
        return new Response(html, {
          headers: { "Content-Type": "text/html" }
        });
      },
      POST: async (req, server) => {
        const url = new URL(req.url);
        const formData = await req.formData();
        const name = formData.get("name");
        const email = formData.get("email") || null;
        const message = formData.get("message");

        if (!name || !message) {
          return Response.redirect(url.origin + "/guestbook/add?error=missing", 302);
        }

        const reqIp = server.requestIP(req);
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || reqIp.address || null;
        const userAgent = req.headers.get("user-agent") || null;
        const acceptLanguage = req.headers.get("accept-language") || null;
        const locale = acceptLanguage?.split(",")[0].split(";")[0] || null;

        db.prepare("INSERT INTO guestbook (name, email, message, ip, user_agent, locale) VALUES (?, ?, ?, ?, ?, ?)").run(name, email, message, ip, userAgent, locale);
        return Response.redirect(url.origin + "/guestbook?success=1", 302);
      }
    },
    "/assets/:file": async req => {
      const file = Bun.file(`./assets/${req.params.file}`);
      if (!(await file.exists())) {
        return new Response(null, { status: 404 });
      }
      return new Response(file);
    },
    "/assets/img/:file": async req => {
      const file = Bun.file(`./assets/img/${req.params.file}`);
      if (!(await file.exists())) {
        return new Response(null, { status: 404 });
      }
      return new Response(file);
    }
  }
});

async function generateGuestbookViewHTML(entries, hasSuccess, locale = 'en-US') {
  const entriesHTML = entries.length === 0
    ? '<div class="loading-message">No entries yet. Be the first to sign!</div>'
    : entries.map(entry => {
      const formatter = new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      const date = formatter.format(new Date(entry.submitted_at));
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

  const successMessage = hasSuccess ? '<div class="success-message">✅ Your entry has been submitted successfully!</div>' : '';

  const tmpl = await Bun.file("./templates/guestbook-view.template.html").text();
  return tmpl
    .replace("{{ entries }}", entriesHTML)
    .replace("{{ successMessage }}", successMessage);
}

async function generateGuestbookAddHTML(hasError) {
  const errorMessage = hasError ? '<div class="error-message">⚠️ Please fill in both name and message fields.</div>' : '';

  const tmpl = await Bun.file("./templates/guestbook-add.template.html").text();
  return tmpl.replace("{{ errorMessage }}", errorMessage);
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

console.log("🌟 VIBELAND server is running on http://localhost:3000");
