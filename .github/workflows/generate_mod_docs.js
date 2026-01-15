const fs = require("fs");
const path = require("path");

// folder z extensions
const extensionsDir = path.join(process.cwd(), "bot/extensions");

// folder wyjściowy
const outDir = path.join(process.cwd(), "docs/dbm");
fs.mkdirSync(outDir, { recursive: true });

// odczyt plików .js
const files = fs.readdirSync(extensionsDir).filter((f) => f.endsWith(".js"));

const result = [];

for (const file of files) {
  const filePath = path.join(extensionsDir, file);
  const module = require(filePath); // CommonJS

  const name = module.name || file.replace(".js", "");
  const description = module.description || "";

  result.push({ name, description });
}

// zapis do extensions.json
const outPath = path.join(outDir, "extensions.json");
fs.writeFileSync(outPath, JSON.stringify(result, null, 2));

console.log("extensions.json generated at", outPath);
