// @env node
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { launchBrowser } from "./browser.ts";
import { CANVAS_HEIGHT, CANVAS_WIDTH, SCALE } from "./constants.ts";

export function slidePages(dir: string, names: string[] = []): string[] {
  const pagesDir = join(resolve(dir), "pages");
  const files = names.length > 0
    ? names.map(name => join(pagesDir, `${basename(name, ".html")}.html`))
    : readdirSync(pagesDir).filter(name => name.endsWith(".html")).sort().map(name => join(pagesDir, name));
  if (files.length === 0) {
    throw new Error(`没有找到页面：${pagesDir}`);
  }
  for (const file of files) {
    if (!existsSync(file)) {
      throw new Error(`页面不存在：${file}`);
    }
  }
  return files;
}

export async function renderPages(dir: string, names: string[] = []): Promise<string[]> {
  const files = slidePages(dir, names);
  const outDir = join(resolve(dir), "out");
  mkdirSync(outDir, { recursive: true });
  const outputs: string[] = [];
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, deviceScaleFactor: SCALE });
    const failed: string[] = [];
    page.on("requestfailed", request => failed.push(decodeURI(request.url())));
    for (const file of files) {
      failed.length = 0;
      await page.goto(pathToFileURL(file).href, { waitUntil: "load" });
      const unreadable = await page.evaluate(async () => {
        await document.fonts.ready;
        return [...document.images].filter(image => image.complete && image.naturalWidth === 0).map(image => image.src);
      });
      const broken = [...new Set([...failed, ...unreadable.map(url => decodeURI(url))])];
      if (broken.length > 0) {
        throw new Error(`${basename(file)} 用到的文件没有加载出来：${broken.join("、")}`);
      }
      const target = join(outDir, `${basename(file, ".html")}.png`) as `${string}.png`;
      await page.screenshot({ path: target });
      outputs.push(target);
    }
  } finally {
    await browser.close();
  }
  return outputs;
}
