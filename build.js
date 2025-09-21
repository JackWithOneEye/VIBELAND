#!/usr/bin/env bun

import { readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

async function updateIndexHTML() {
  try {
    // Read current index.html
    const indexPath = "index.html";
    const currentContent = await readFile(indexPath, "utf-8");

    // Read pages directory
    const pagesDir = "pages";
    const pageFiles = await readdir(pagesDir);
    const htmlFiles = pageFiles.filter(file => file.endsWith('.html'));

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

    // Update timestamp
    const now = new Date();
    const timestamp = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Update links section and timestamp
    const contentWithNewLinks = currentContent.replace(
      /<ul>[\s\S]*?<\/ul>/,
      newLinksSection
    );

    const newContent = contentWithNewLinks.replace(
      /Last updated: [^<]+/,
      `Last updated: ${timestamp}`
    );

    await writeFile(indexPath, newContent, "utf-8");
    console.log(`Updated index.html with ${htmlFiles.length} pages`);
    console.log(`Last updated timestamp: ${timestamp}`);
    return true;

  } catch (error) {
    console.error("Build failed:", error.message);
    process.exit(1);
  }
}

// Run the build
updateIndexHTML();
