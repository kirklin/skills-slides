// @env node
import type { Browser } from "puppeteer-core";
import type { CheckOptions, Finding, Problem } from "./types.ts";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { launchBrowser } from "./browser.ts";
import { CANVAS_HEIGHT, CANVAS_WIDTH, MIN_PLACEHOLDER_LENGTH, PAGES_DIR, SAFE_AREA_VARIABLES, STYLES_DIR, TEXT_RULES } from "./constants.ts";
import { collectTexts, inspectPage } from "./inspect.ts";

export function listPages(paths: string[]): string[] {
  const files = paths.flatMap((path) => {
    const full = resolve(path);
    return statSync(full).isDirectory()
      ? readdirSync(full).filter(name => name.endsWith(".html")).sort().map(name => join(full, name))
      : [full];
  });
  if (files.length === 0) {
    throw new Error(`没有找到页面：${paths.join(" ")}`);
  }
  return files;
}

export function checkText(text: string): Finding[] {
  return TEXT_RULES.flatMap(({ kind, pattern, keep }) => [...text.matchAll(pattern)]
    .map(([match]) => match)
    .filter(match => keep?.(match) ?? true)
    .map(match => ({ kind, text, match })));
}

function samplePageFiles(): string[] {
  const dirs = [PAGES_DIR, ...readdirSync(STYLES_DIR).map(style => join(STYLES_DIR, style, "pages")).filter(dir => existsSync(dir))];
  return dirs.flatMap(dir => readdirSync(dir).filter(name => name.endsWith(".html")).map(name => join(dir, name)));
}

// Short sample texts such as names, and texts with numbers such as ticks, also show up in real content.
async function placeholderTexts(browser: Browser): Promise<Set<string>> {
  const page = await browser.newPage();
  const texts = new Set<string>();
  for (const file of samplePageFiles()) {
    await page.goto(pathToFileURL(file).href, { waitUntil: "domcontentloaded" });
    for (const text of await page.evaluate(collectTexts)) {
      if ([...text].length >= MIN_PLACEHOLDER_LENGTH && !/\d/.test(text)) {
        texts.add(text);
      }
    }
  }
  await page.close();
  return texts;
}

export async function checkPages(files: string[], { placeholders = true }: CheckOptions = {}): Promise<Problem[]> {
  const problems: Problem[] = [];
  const browser = await launchBrowser();
  try {
    const samples = placeholders ? await placeholderTexts(browser) : new Set<string>();
    const page = await browser.newPage();
    await page.setViewport({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
    for (const file of files) {
      await page.goto(pathToFileURL(file).href, { waitUntil: "load" });
      await page.evaluate(async () => {
        await document.fonts.ready;
      });
      const { texts, contents, boxes, findings } = await page.evaluate(inspectPage, SAFE_AREA_VARIABLES);
      const leftovers = [
        ...contents.filter(text => samples.has(text)).map(text => ({ kind: "样例的占位文字没有换掉", text })),
        ...(placeholders ? boxes.map(text => ({ kind: "占位框还没有换掉", text })) : []),
      ];
      for (const finding of [...texts.flatMap(checkText), ...findings, ...leftovers]) {
        problems.push({ file, ...finding });
      }
    }
  } finally {
    await browser.close();
  }
  return problems;
}
