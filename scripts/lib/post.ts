// @env node
import type { Post, PostOptions, Shot } from "./types.ts";
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { launchBrowser } from "./browser.ts";
import { SCALE } from "./constants.ts";

const EMBED_SELECTOR = "iframe[id^=\"twitter-widget\"]";

export function postId(value: string): string {
  if (/^\d+$/.test(value)) {
    return value;
  }
  const id = /\/status\/(\d+)/.exec(new URL(value).pathname)?.[1];
  if (!id) {
    throw new Error(`链接里没有帖子编号：${value}`);
  }
  return id;
}

export function parsePosts(items: string[]): Post[] {
  return items.map((item) => {
    const at = item.indexOf("=");
    if (at <= 0) {
      throw new Error(`参数要写成 名称=帖子链接：${item}`);
    }
    return { name: item.slice(0, at), id: postId(item.slice(at + 1)) };
  });
}

function embedHtml(id: string, { theme, lang }: PostOptions): string {
  return `<!doctype html><html><head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 20px; background: ${theme === "dark" ? "#000" : "#fff"}">
<blockquote class="twitter-tweet" data-theme="${theme}" data-dnt="true" data-conversation="none" data-width="550" data-lang="${lang}"><a href="https://twitter.com/i/status/${id}"></a></blockquote>
<script async src="https://platform.twitter.com/widgets.js"></script>
</body></html>`;
}

export async function shootPosts(outDir: string, posts: Post[], options: PostOptions): Promise<Shot[]> {
  if (options.theme !== "dark" && options.theme !== "light") {
    throw new Error(`POST_THEME 只能是 dark 或 light：${options.theme}`);
  }
  const out = resolve(outDir);
  mkdirSync(out, { recursive: true });
  const shots: Shot[] = [];
  const browser = await launchBrowser();
  try {
    for (const { name, id } of posts) {
      const page = await browser.newPage();
      await page.setViewport({ width: 620, height: 1800, deviceScaleFactor: SCALE });
      await page.emulateTimezone(options.timezone);
      await page.setContent(embedHtml(id, options), { waitUntil: "load", timeout: 60_000 });
      const frame = await page.waitForSelector(EMBED_SELECTOR, { timeout: 60_000 });
      if (!frame) {
        throw new Error(`帖子没有加载出来：${id}`);
      }
      await page.waitForFunction(selector => (document.querySelector(selector)?.getBoundingClientRect().height ?? 0) > 200, { timeout: 30_000 }, EMBED_SELECTOR);
      // The embed keeps loading avatars and media after it reaches its full height.
      await sleep(4000);
      const file = join(out, `${name}.png`) as `${string}.png`;
      await frame.screenshot({ path: file });
      const box = await frame.boundingBox();
      if (!box) {
        throw new Error(`帖子没有显示出来：${id}`);
      }
      shots.push({ file, width: Math.round(box.width), height: Math.round(box.height) });
      await page.close();
    }
  } finally {
    await browser.close();
  }
  return shots;
}
