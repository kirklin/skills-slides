import process from "node:process";
import { useStyle } from "./lib/style.ts";

const [style, dir] = process.argv.slice(2);
if (!style || !dir) {
  throw new Error("用法：node use-style.ts <风格名> <配图目录>");
}
console.log(useStyle(style, dir));
