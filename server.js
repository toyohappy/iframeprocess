import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
const JAPAN_TIMEZONE = "Asia/Tokyo";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://fooidemix.shop");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-client-timezone");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  next();
});

app.get("/getData", (req, res) => {
  const gclid = req.query.gclid || "";
  const timezone = req.headers["x-client-timezone"] || "";

  // ❌ No gclid
  if (!gclid) {
    return res.status(204).end();
  }

  // ❌ Not Japan
  if (timezone !== JAPAN_TIMEZONE) {
    return res.status(204).end();
  }

  // ✅ Load index.html content
  const htmlPath = path.join(__dirname, "test", "index.html");
  let html = fs.readFileSync(htmlPath, "utf8");

  // Optional: inject gclid into HTML
  html = html.replace(
    "</head>",
    `<script>window.gclid="${gclid}"</script></head>`
  );

  res.setHeader("Content-Type", "text/html");
  return res.send(html);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
