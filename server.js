import { serve } from "bun";
import { file } from "bun";

serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = url.pathname;

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
