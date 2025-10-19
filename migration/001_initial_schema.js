/**
 * @param db {import('bun:sqlite').Database}
 */
export function up(db) {
  // Create guestbook table
  db.transaction(() => {
    db.run(`
      CREATE TABLE user_agent (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        value TEXT NOT NULL,
        hash INTEGER NOT NULL
      );
    `);
    db.run("CREATE UNIQUE INDEX user_agent_hash ON user_agent(hash)");

    db.run(`
      CREATE TABLE guestbook (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        name VARCHAR(63) NOT NULL,
        email VARCHAR(255) NULL,
        message VARCHAR(2047) NOT NULL,

        ip VARCHAR(45) NULL,
        user_agent_id INTEGER NULL,
        locale VARCHAR(15) NULL,

        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        reviewed_at DATETIME NULL DEFAULT NULL,
        approved TINYINT DEFAULT 0,

        FOREIGN KEY (user_agent_id) REFERENCES user_agent(id) ON UPDATE CASCADE ON DELETE SET NULL
      )
    `);
    db.run("CREATE INDEX idx_guestbook_submitted_at ON guestbook(submitted_at)");
    db.run("CREATE INDEX idx_guestbook_reviewed_at ON guestbook(reviewed_at)");
    db.run("CREATE INDEX idx_guestbook_approved ON guestbook(approved)");

    db.run(`
      CREATE TABLE visitors (
        date DATE NOT NULL,
        ip_hash VARCHAR(256) NOT NULL,
        user_agent_id INTEGER NULL,

        PRIMARY KEY (date, ip_hash),
        FOREIGN KEY (user_agent_id) REFERENCES user_agent(id) ON UPDATE CASCADE ON DELETE SET NULL
      )
    `);

    const exampleUas = [
      "Mozilla/4.7 [en] (Win98; I)",
      "Mozilla/4.0 (compatible; MSIE 5.0; Windows 95)",
      "Mozilla/4.61 [en] (X11; I; Linux 2.2.5 i586)",
      "Mozilla/4.0 (compatible; MSIE 4.01; Windows NT)",
    ];
    const insertUa = db.prepare("INSERT INTO user_agent (value, hash) VALUES (?, ?)");
    const uaIds = exampleUas.map((ua) => insertUa.run(ua, Bun.hash(ua)).lastInsertRowid);

    // Insert initial guestbook entries
    const insertEntry = db.prepare("INSERT INTO guestbook (name, email, message, ip, user_agent_id, locale, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?)");

    // Three overly praising entries
    insertEntry.run(
      "WebMaster97",
      "webmaster97@geocities.com",
      "VIBELAND is absolutely MIND-BLOWING! This is the most incredible website I've ever experienced! The dynamic effects are pure genius and the cutting-edge design is PERFECTION! You've created something truly magical here!!!",
      "203.45.128.92",
      /** @type {any} */(uaIds[0]),
      "en-US",
      "1999-08-15 14:30:22"
    );

    insertEntry.run(
      "RetroFan2000",
      null,
      "OH MY GOD! VIBELAND is like stepping into the future of web design! Every pixel screams excellence! This is what the internet was MEANT to be! I've bookmarked this and I'm telling EVERYONE about it! REVOLUTIONARY!!!",
      "198.162.34.17",
      /** @type {any} */(uaIds[1]),
      "en-GB",
      "1999-09-03 09:15:41"
    );

    insertEntry.run(
      "DigitalDreamer",
      "dreamer@hotmail.com",
      "VIBELAND has completely changed my life! The visual experience is transcendent and the innovative design makes every other website look ancient! This is pure ART mixed with cutting-edge technology! I'm in absolute AWE!",
      "142.78.201.5",
      /** @type {any} */(uaIds[2]),
      "en-US",
      "1999-09-12 16:45:33"
    );

    // One dismissive negative comment
    insertEntry.run(
      "SkepticalSurfer",
      null,
      "meh. just another flashy website with unnecessary animations. seen it all before. nothing special here, just more digital noise cluttering up cyberspace.",
      "205.188.77.143",
      /** @type {any} */(uaIds[3]),
      "en-US",
      "1999-09-20 11:22:15"
    );
  })();
}

/**
 * @param db {import('bun:sqlite').Database}
 */
export function down(db) {
  db.run("DROP TABLE IF EXISTS user_agent");
  db.run("DROP TABLE IF EXISTS guestbook");
  db.run("DROP TABLE IF EXISTS visitors");
}
