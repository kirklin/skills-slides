// @env node
import type { Token } from "marked";
import type { DocImage, ExportResult } from "./types.ts";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { lexer, walkTokens } from "marked";
import { SHEET_NAME } from "./constants.ts";
import { drawSheet } from "./sheet.ts";

type FoundImage = Omit<DocImage, "number">;

function slideNumber(src: string): string | undefined {
  return /^(\d{2,3})-/.exec(basename(src))?.[1];
}

export function collectImages(docPath: string): DocImage[] {
  const doc = resolve(docPath);
  const found: FoundImage[] = [];
  const seen = new Set<string>();
  let chapter = "";
  let section = "";
  walkTokens(lexer(readFileSync(doc, "utf8")), (token: Token) => {
    if (token.type === "heading" && token.depth === 2) {
      chapter = token.text;
      section = "";
    }
    if (token.type === "heading" && token.depth === 3) {
      section = token.text;
    }
    if (token.type !== "image") {
      return;
    }
    const src = resolve(dirname(doc), decodeURI(token.href));
    if (seen.has(src)) {
      return;
    }
    if (!existsSync(src)) {
      throw new Error(`文档引用的图片不存在：${token.href}`);
    }
    if (!token.text.trim()) {
      throw new Error(`图片缺少说明文字：${token.href}`);
    }
    seen.add(src);
    found.push({ src, title: token.text.trim(), place: [chapter, section].filter(Boolean).join(" › ") });
  });
  const first = found[0];
  if (!first) {
    throw new Error(`文档里没有图片：${doc}`);
  }
  const base = Number(slideNumber(first.src) ?? 1) === 0 ? 0 : 1;
  return found.map((image, index) => {
    const number = String(index + base).padStart(2, "0");
    const own = slideNumber(image.src);
    if (own !== undefined && Number(own) !== index + base) {
      throw new Error(`配图的序号和文档里的顺序不一致：第 ${index + 1} 张是 ${basename(image.src)}，序号应该是 ${number}，先按文档顺序重新编号`);
    }
    return { ...image, number };
  });
}

export async function exportSlides(docPath: string, outDir: string, title?: string): Promise<ExportResult> {
  const out = resolve(outDir);
  if (existsSync(out) && readdirSync(out).length > 0) {
    throw new Error(`输出目录里已经有文件：${out}，先把它移到废纸篓再导出`);
  }
  const images = collectImages(docPath);
  mkdirSync(out, { recursive: true });
  const files = images.map((image) => {
    const file = join(out, `${image.number} ${image.title.replaceAll("/", "／").replaceAll(":", "：")}.png`);
    copyFileSync(image.src, file);
    return file;
  });
  const sheet = join(out, SHEET_NAME);
  await drawSheet(
    sheet,
    title ?? `${basename(docPath, ".md")}的全部配图`,
    `共 ${images.length} 张，按文档里出现的顺序排列，每张下面是它所在的章节。`,
    images.map((image, index) => ({ file: files[index] ?? image.src, number: image.number, title: image.title, note: image.place })),
  );
  return { files, sheet };
}
