const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const TMP_DIR = path.join(ROOT, "tmp");
const OUTPUT = path.join(ROOT, "model.js");
const EXCLUDE = new Set(["TODO"]);

function normalizeEntry(content) {
  let line = content.replace(/\r?\n$/, "");
  if (!line.endsWith(",")) {
    line += ",";
  }
  return line + "\n";
}

function buildModelList() {
  const entries = fs.readdirSync(TMP_DIR, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && !EXCLUDE.has(entry.name))
    .map((entry) => entry.name)
    .sort();

  const lines = files.map((name) => {
    const content = fs.readFileSync(path.join(TMP_DIR, name), "utf8");
    return normalizeEntry(content);
  });

  const content = "var modelSrc = [\n" + lines.join("") + "];\n";

  fs.writeFileSync(OUTPUT, content, "utf8");
  console.log(`Wrote ${files.length} file(s) to model.js`);
  files.forEach((name) => console.log(`  tmp/${name}`));
}

buildModelList();
