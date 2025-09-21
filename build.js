#!/usr/bin/env bun

import { readdir, readFile, writeFile, watch } from "fs/promises";
import { join } from "path";

async function updateIndexHTML() {
  try {
    // Read current index.html
    const indexPath = "index.html";
    const currentContent = await readFile(indexPath, "utf-8");

    // Read pages directory
    const pagesDir = "pages";
    const pageFiles = await readdir(pagesDir);
    const htmlFiles = pageFiles.filter(file => file.endsWith('.html')).sort();

    // Generate new links section
    const linksList = htmlFiles.map(file => {
      const displayName = file.replace('.html', '').replace(/[-_]/g, ' ');
      const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      return `                <li><a href="pages/${file}">${capitalizedName}</a></li>`;
    }).join('\n');

    // Create new links section
    const newLinksSection = `<ul>
${linksList}
            </ul>`;

    // Update links section only
    const newContent = currentContent.replace(
      /<ul>[\s\S]*?<\/ul>/,
      newLinksSection
    );

    await writeFile(indexPath, newContent, "utf-8");
    console.log(`Updated index.html with ${htmlFiles.length} pages`);
    return true;

  } catch (error) {
    console.error("Build failed:", error.message);
    process.exit(1);
  }
}

// File watching functionality
async function startWatcher() {
  console.log("🔍 Starting file watcher for /pages directory...");

  try {
    const watcher = watch("pages", { recursive: false });

    console.log("✅ File watcher started successfully!");
    console.log("📁 Watching for changes in /pages directory");
    console.log("🔄 Will automatically rebuild index.html when files are added/removed");
    console.log("⏹️  Press Ctrl+C to stop watching\n");

    for await (const event of watcher) {
      const { eventType, filename } = event;

      // Only process HTML files
      if (filename && filename.endsWith('.html')) {
        console.log(`📝 Detected ${eventType} event for: ${filename}`);

        // Rebuild index.html
        console.log("🔄 Rebuilding index.html...");
        const success = await updateIndexHTML();

        if (success) {
          console.log("✅ Build completed successfully!\n");
        }
      }
    }
  } catch (error) {
    console.error("❌ File watcher error:", error.message);
    process.exit(1);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
const watchMode = args.includes('--watch') || args.includes('-w');

if (watchMode) {
  // Run initial build then start watching
  console.log("🚀 Running initial build...");
  await updateIndexHTML();
  console.log("✅ Initial build completed!\n");

  // Start file watcher
  await startWatcher();
} else {
  // Run the build once
  updateIndexHTML();
}
