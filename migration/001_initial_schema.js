export function up(db) {
  // Create guestbook table
  db.run(`
    CREATE TABLE IF NOT EXISTS guestbook (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert initial guestbook entries
  const insertEntry = db.prepare("INSERT INTO guestbook (name, message, timestamp) VALUES (?, ?, ?)");
  
  // Three overly praising entries
  insertEntry.run(
    "WebMaster97",
    "VIBELAND is absolutely MIND-BLOWING! This is the most incredible website I've ever experienced! The dynamic effects are pure genius and the cutting-edge design is PERFECTION! You've created something truly magical here!!!",
    "1999-08-15 14:30:22"
  );
  
  insertEntry.run(
    "RetroFan2000",
    "OH MY GOD! VIBELAND is like stepping into the future of web design! Every pixel screams excellence! This is what the internet was MEANT to be! I've bookmarked this and I'm telling EVERYONE about it! REVOLUTIONARY!!!",
    "1999-09-03 09:15:41"
  );
  
  insertEntry.run(
    "DigitalDreamer",
    "VIBELAND has completely changed my life! The visual experience is transcendent and the innovative design makes every other website look ancient! This is pure ART mixed with cutting-edge technology! I'm in absolute AWE!",
    "1999-09-12 16:45:33"
  );
  
  // One dismissive negative comment
  insertEntry.run(
    "SkepticalSurfer",
    "meh. just another flashy website with unnecessary animations. seen it all before. nothing special here, just more digital noise cluttering up cyberspace.",
    "1999-09-20 11:22:15"
  );
}

export function down(db) {
  db.run("DROP TABLE IF EXISTS guestbook");
}
