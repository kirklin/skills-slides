import { basename } from "node:path";
import process from "node:process";
import { checkPages, listPages } from "./lib/check.ts";

const args = process.argv.slice(2);
if (args.length === 0) {
  throw new Error("用法：node check-pages.ts <页面目录或页面.html> ...");
}
const files = listPages(args);
const problems = await checkPages(files);
const excerpt = (text: string): string => text.length > 40 ? `${text.slice(0, 40)}…` : text;
for (const { file, kind, text, match } of problems) {
  console.log(`${basename(file)}  ${kind}  ${match ? `「${match}」在` : ""}「${excerpt(text)}」`);
}
console.log(problems.length === 0 ? `${files.length} 页没有发现问题` : `${files.length} 页里有 ${problems.length} 处问题`);
process.exitCode = problems.length === 0 ? 0 : 1;
