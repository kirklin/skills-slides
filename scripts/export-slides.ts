import process from "node:process";
import { exportSlides } from "./lib/export.ts";

const [doc, out, title] = process.argv.slice(2);
if (!doc || !out) {
  throw new Error("用法：node export-slides.ts <文档.md> <输出目录> [汇总图标题]");
}
const { files, sheet } = await exportSlides(doc, out, title);
console.log(`已导出 ${files.length} 张配图，汇总图是 ${sheet}`);
