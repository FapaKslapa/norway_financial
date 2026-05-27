import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function walk(dir: string): string[] {
  const entries = readdirSync(dir);
  return entries.flatMap((e) => {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) return walk(full);
    if (/\.(ts|tsx)$/.test(e)) return [full];
    return [];
  });
}

const files = walk(join(process.cwd(), "src"));

let changed = 0;

for (const file of files) {
  const original = readFileSync(file, "utf8");
  const result = removeComments(original);
  if (result !== original) {
    writeFileSync(file, result, "utf8");
    changed++;
    console.log(`cleaned: ${file.replace(`${process.cwd()}/`, "")}`);
  }
}

console.log(`\nDone. ${changed} file(s) modified.`);

function removeComments(src: string): string {
  let out = "";
  let i = 0;
  let inString: false | '"' | "'" | "`" = false;
  let escaped = false;
  let templateDepth = 0;

  while (i < src.length) {
    const ch = src[i];
    const next = src[i + 1];

    if (escaped) {
      out += ch;
      escaped = false;
      i++;
      continue;
    }

    if (inString) {
      if (ch === "\\") {
        escaped = true;
        out += ch;
        i++;
        continue;
      }
      if (inString === "`") {
        if (ch === "$" && next === "{") {
          templateDepth++;
          out += ch;
          i++;
          continue;
        }
        if (ch === "}" && templateDepth > 0) {
          templateDepth--;
          out += ch;
          i++;
          continue;
        }
      }
      if (ch === inString && templateDepth === 0) {
        inString = false;
      }
      out += ch;
      i++;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch as '"' | "'" | "`";
      out += ch;
      i++;
      continue;
    }

    if (ch === "/" && next === "/") {
      const lineStart = i;
      let end = i + 2;
      while (end < src.length && src[end] !== "\n") end++;
      const commentText = src.slice(lineStart, end);

      if (commentText.includes("biome-ignore")) {
        out += commentText;
      }

      i = end;
      continue;
    }

    if (ch === "/" && next === "*") {
      let end = i + 2;
      while (
        end < src.length - 1 &&
        !(src[end] === "*" && src[end + 1] === "/")
      ) {
        end++;
      }
      end += 2;
      const commentText = src.slice(i, end);

      if (commentText.includes("biome-ignore")) {
        out += commentText;
      }

      i = end;
      continue;
    }

    out += ch;
    i++;
  }

  return collapseBlankLines(out);
}

function collapseBlankLines(src: string): string {
  return src.replace(/\n{3,}/g, "\n\n");
}
