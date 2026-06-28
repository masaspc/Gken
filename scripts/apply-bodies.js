const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const contentPath = path.join(root, "content", "lesson-content.json");
const bodiesPath = path.join(root, "content", "lesson-bodies.json");
const content = JSON.parse(fs.readFileSync(contentPath, "utf8"));
const bodies = JSON.parse(fs.readFileSync(bodiesPath, "utf8"));
let applied = 0, created = 0;
for (const slug of Object.keys(bodies)) {
  if (!content[slug]) { content[slug] = {}; created += 1; }
  content[slug].body = bodies[slug].body;
  if (bodies[slug].callouts) content[slug].callouts = bodies[slug].callouts;
  applied += 1;
}
fs.writeFileSync(contentPath, JSON.stringify(content, null, 2), "utf8");
console.log("applied:", applied, "| created entries:", created, "| total entries:", Object.keys(content).length);
