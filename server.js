/** @import { GuestbookEntry } from "./types" */
import { Database } from "bun:sqlite";

const db = new Database("vibeland.db", { create: true });

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
    "/snake": Bun.file("./pages/snake.html"),
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
        const locale = acceptLanguage.split(',')[0]?.split(';')[0] || 'en-US';

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
        const formData = await req.formData();
        const name = formData.get("name");
        const message = formData.get("message");

        if (typeof name !== 'string' || typeof message !== 'string') {
          return Response.redirect("/guestbook/add?error=missing", 302);
        }

        let email = formData.get("email");
        if (typeof email !== 'string') {
          email = null;
        } else {
          email = escapeHtml(email);
        }

        const reqIp = server.requestIP(req);
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || reqIp?.address || null;
        const userAgent = req.headers.get("user-agent") || null;
        const acceptLanguage = req.headers.get("accept-language") || null;
        const locale = acceptLanguage?.split(",")[0]?.split(";")[0] || null;

        db.prepare("INSERT INTO guestbook (name, email, message, ip, user_agent_id, locale) VALUES (?, ?, ?, ?, ?, ?)")
          .run(escapeHtml(name), email, escapeHtml(message), ip, getUserAgentId(userAgent), locale);

        return Response.redirect("/guestbook?success=1", 302);
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
    },
    "/api/hit": {
      POST: async (req, server) => {
        const reqIp = server.requestIP(req);
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
          || req.headers.get("x-real-ip")
          || reqIp?.address
          || null;
        const ua = req.headers.get("user-agent") || "";
        const dnt = req.headers.get("dnt") || "0";
        const today = new Date().toISOString().slice(0, 10);

        if (dnt !== "1") {
          const ipHash = await hashVisitor(ip, ua, process.env.VIBELAND_SALT);
          if (ipHash) {
            db.prepare(`
              INSERT INTO visitors (date, ip_hash, user_agent_id)
              VALUES (?, ?, ?)
              ON CONFLICT(date, ip_hash) DO NOTHING
            `).run(today, ipHash, getUserAgentId(ua));
          }
        }

        const row = db.prepare("SELECT COUNT(*) AS c FROM visitors").get();
        const count = row?.c ?? 0;

        return new Response(count, {
          headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" }
        });
      }
    }
  }
});

/**
 * @param entries {GuestbookEntry[]}
 * @param hasSuccess {boolean}
 */
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

/**
 * @param hasError {boolean}
 */
async function generateGuestbookAddHTML(hasError) {
  const errorMessage = hasError ? '<div class="error-message">⚠️ Please fill in both name and message fields.</div>' : '';

  const tmpl = await Bun.file("./templates/guestbook-add.template.html").text();
  return tmpl.replace("{{ errorMessage }}", errorMessage);
}

/**
 * @param text {string}
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => { return map[/** @type {keyof typeof map} */ (m)]; });
}

/**
 * @param {string?} userAgent
 */
function getUserAgentId(userAgent) {
  if (!userAgent) {
    return null;
  }
  const uaHash = Bun.hash(userAgent);
  const ua = db.prepare("SELECT id FROM user_agent WHERE hash = ?").get(uaHash);
  if (ua === null) {
    const { lastInsertRowid } = db.prepare("INSERT INTO user_agent (value, hash) VALUES (?, ?)").run(userAgent, uaHash);
    return lastInsertRowid;
  }
  return ua.id;
}

/**
 * @param ip {string | null}
 * @param ua {string}
 * @param salt {string | undefined}
 */
async function hashVisitor(ip, ua, salt) {
  if (!ip) return null;
  const s = salt || process.env.VIBELAND_SALT || "vibeland-default-salt";
  const input = s + "|" + ip + "|" + (ua || "");
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

console.log("🌟 VIBELAND server is running on http://localhost:3000");
