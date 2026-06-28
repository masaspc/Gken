const fs = require("fs");

const html = fs.readFileSync("gtest-quiz.html", "utf8");

function extractArray(name, nextMarker) {
  const startMarker = `const ${name}`;
  const start = html.indexOf(startMarker);
  if (start < 0) throw new Error(`${name} not found`);
  const equals = html.indexOf("=", start);
  const arrayStart = html.indexOf("[", equals);
  const next = html.indexOf(nextMarker, arrayStart);
  if (next < 0) throw new Error(`${nextMarker} not found`);
  const arrayEnd = html.lastIndexOf("];", next);
  if (arrayEnd < arrayStart) throw new Error(`${name} end not found`);
  return html.slice(arrayStart, arrayEnd + 1);
}

const questions = eval(extractArray("QUESTIONS", "const CATS"));
const glossary = eval(extractArray("GLOSSARY", "const GCATS"));

fs.mkdirSync("content", { recursive: true });
fs.writeFileSync("content/gtest-questions.json", JSON.stringify(questions, null, 2), "utf8");
fs.writeFileSync("content/gtest-glossary.json", JSON.stringify(glossary, null, 2), "utf8");

console.log(`Extracted ${questions.length} questions and ${glossary.length} glossary terms.`);
