import process from "node:process";
import { parsePosts, shootPosts } from "./lib/post.ts";

const [out, ...items] = process.argv.slice(2);
if (!out || items.length === 0) {
  throw new Error("用法：node post-shot.ts <输出目录> <名称>=<帖子链接或编号> ...");
}
const shots = await shootPosts(out, parsePosts(items), {
  theme: process.env.POST_THEME ?? "dark",
  lang: process.env.POST_LANG ?? "zh-cn",
  timezone: process.env.POST_TZ ?? "Asia/Shanghai",
});
for (const { file, width, height } of shots) {
  console.log(`${file} ${width}×${height}`);
}
