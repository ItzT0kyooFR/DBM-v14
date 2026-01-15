import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const Path = {
  actions: path.resolve(__dirname, "actions.json"),
  events: path.resolve(__dirname, "events.json"),
  extensions: path.resolve(__dirname, "extensions.json"),
  actionsDir: path.resolve(__dirname, "../../bot/actions"),
  eventsDir: path.resolve(__dirname, "../../bot/events"),
  extensionsDir: path.resolve(__dirname, "../../bot/extensions"),
};
async function readJsonSafe(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}
async function generateDocs(dirPath, outPath, typeName) {
  console.log(`\n=== ${typeName} ===`);
  const existing = await readJsonSafe(outPath);
  const existingMap = new Map(existing.map((e) => [e.name, e]));
  const files = (await fs.readdir(dirPath)).filter((f) => f.endsWith(".js"));
  let added = 0;
  for (const f of files) {
    const filePath = path.join(dirPath, f);
    const mod = await import(`file://${filePath}`);
    const module = mod.default ?? mod;
    const name = module.displayName || module.name;
    if (!name) continue;
    if (existingMap.has(name)) continue;
    let object;
    if (typeName === "Actions") {
      object = {
        name,
        description: module.description || "",
        section: module.section ?? null,
      };
    } else {
      object = {
        name,
        description: module.description || "",
      };
    }
    existing.push(object);
    existingMap.set(name, object);
    added++;
  }
  if (typeName === "Actions") {
    existing.sort((a, b) => {
      const secA = (a.section ?? "").toLowerCase();
      const secB = (b.section ?? "").toLowerCase();
      if (secA !== secB) {
        return secA.localeCompare(secB);
      }
      return (a.name ?? "")
        .toLowerCase()
        .localeCompare((b.name ?? "").toLowerCase());
    });
  }
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(existing, null, 2));
  console.log("Existing:", existing.length - added);
  console.log("Added:", added);
  console.log("Total:", existing.length);
}

await generateDocs(Path.actionsDir, Path.actions, "Actions");
await generateDocs(Path.eventsDir, Path.events, "Events");
await generateDocs(Path.extensionsDir, Path.extensions, "Extensions");
