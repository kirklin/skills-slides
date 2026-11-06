import process from "node:process";
import { addPage } from "./lib/style.ts";

const [dir, layout, name] = process.argv.slice(2);
if (!dir || !layout || !name) {
  throw new Error("用法：node add-page.ts <配图目录> <版式英文名> <序号-页名>");
}
console.log(addPage(dir, layout, name));
