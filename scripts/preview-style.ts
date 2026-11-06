import { resolve } from "node:path";
import process from "node:process";
import { previewStyle } from "./lib/preview.ts";

const [style, target] = process.argv.slice(2);
if (!style || !target) {
  throw new Error("用法：node preview-style.ts <风格名或风格目录> <汇总图.png>");
}
await previewStyle(style, target);
console.log(resolve(target));
