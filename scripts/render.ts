import process from "node:process";
import { renderPages } from "./lib/render.ts";

const [dir, ...names] = process.argv.slice(2);
if (!dir) {
  throw new Error("用法：node render.ts <配图目录> [页名 ...]");
}
for (const file of await renderPages(dir, names)) {
  console.log(file);
}
