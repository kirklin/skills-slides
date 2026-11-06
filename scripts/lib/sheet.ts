// @env node
import type { SheetItem } from "./types.ts";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { launchBrowser } from "./browser.ts";
import { CANVAS_WIDTH, MAX_IMAGE_SIDE, SCALE } from "./constants.ts";

function escapeHtml(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;");
}

function sheetHtml(title: string, subtitle: string, items: SheetItem[]): string {
  const cells = items.map(item => `<div class="item">
  <img src="${pathToFileURL(item.file).href}">
  <div class="cap"><b>${escapeHtml(item.number)}</b>${escapeHtml(item.title)}</div>
  <p class="note">${escapeHtml(item.note)}</p>
</div>`);
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: ${CANVAS_WIDTH}px; padding: 72px 64px; background: #000; color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", sans-serif; -webkit-font-smoothing: antialiased; }
  h1 { font-size: 56px; font-weight: 600; letter-spacing: -0.01em; }
  .sub { margin-top: 14px; font-size: 26px; color: #86868b; }
  .grid { margin-top: 44px; display: grid; grid-template-columns: repeat(${Math.min(3, items.length)}, 1fr); gap: 40px 32px; }
  .item img { display: block; width: 100%; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 14px; }
  .cap { margin-top: 14px; display: flex; align-items: baseline; gap: 12px; font-size: 24px; font-weight: 600; }
  .cap b { color: #2997ff; }
  .note { margin-top: 6px; font-size: 19px; line-height: 1.45; color: #86868b; }
</style></head><body>
<h1>${escapeHtml(title)}</h1>
<p class="sub">${escapeHtml(subtitle)}</p>
<div class="grid">
${cells.join("\n")}
</div>
</body></html>`;
}

export async function drawSheet(target: string, title: string, subtitle: string, items: SheetItem[]): Promise<void> {
  const file = resolve(target);
  if (existsSync(file)) {
    throw new Error(`文件已经存在：${file}，先把它移到废纸篓再生成`);
  }
  mkdirSync(dirname(file), { recursive: true });
  const workDir = mkdtempSync(join(tmpdir(), "slides-sheet-"));
  const htmlPath = join(workDir, "sheet.html");
  writeFileSync(htmlPath, sheetHtml(title, subtitle, items));
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: CANVAS_WIDTH, height: 100 });
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.setViewport({ width: CANVAS_WIDTH, height: 100, deviceScaleFactor: Math.min(SCALE, MAX_IMAGE_SIDE / height) });
    await page.screenshot({ path: file as `${string}.png`, fullPage: true });
  } finally {
    await browser.close();
    rmSync(workDir, { recursive: true });
  }
}
