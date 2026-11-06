import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CANVAS_WIDTH, MAX_IMAGE_SIDE, SCALE } from "./constants.ts";
import { collectImages, exportSlides } from "./export.ts";
import { imageSizes } from "./image.ts";
import { renderPages } from "./render.ts";
import { stageStyle } from "./style.ts";

let dir = "";

function writeDoc(name: string, lines: string[]): string {
  const file = join(dir, name);
  writeFileSync(file, `${lines.join("\n\n")}\n`);
  return file;
}

beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), "export-"));
  stageStyle("launch-dark", dir);
  await renderPages(dir, ["00-cover", "01-agenda", "02-section", "03-bullets"]);
});

afterAll(() => {
  rmSync(dir, { recursive: true });
});

describe("collectImages", () => {
  it("lists images in document order with their chapters", () => {
    const doc = writeDoc("order.md", [
      "# 文档标题",
      "![项目名称](out/00-cover.png)",
      "## 一、第一章",
      "### 第一节",
      "![第一张配图](out/01-agenda.png)",
      "## 二、第二章",
      "![第二张配图](out/02-section.png)",
      "同一张图引用两次只算一次：",
      "![第二张配图](out/02-section.png)",
    ]);
    expect(collectImages(doc).map(({ number, title, place }) => ({ number, title, place }))).toEqual([
      { number: "00", title: "项目名称", place: "" },
      { number: "01", title: "第一张配图", place: "一、第一章 › 第一节" },
      { number: "02", title: "第二张配图", place: "二、第二章" },
    ]);
  });

  it("starts from 01 when the first image is not numbered 00", () => {
    const doc = writeDoc("from-one.md", ["![第一张配图](out/01-agenda.png)", "![第二张配图](out/02-section.png)"]);
    expect(collectImages(doc).map(image => image.number)).toEqual(["01", "02"]);
  });

  it("stops when the numbers do not follow the document order", () => {
    const doc = writeDoc("swapped.md", ["![项目名称](out/00-cover.png)", "![第三张配图](out/03-bullets.png)"]);
    expect(() => collectImages(doc)).toThrow("配图的序号和文档里的顺序不一致");
  });

  it("stops when an image has no caption", () => {
    const doc = writeDoc("no-caption.md", ["![](out/00-cover.png)"]);
    expect(() => collectImages(doc)).toThrow("图片缺少说明文字");
  });

  it("stops when an image does not exist", () => {
    const doc = writeDoc("missing.md", ["![项目名称](out/00-cover.png)", "![还没有渲染的一页](out/01-missing.png)"]);
    expect(() => collectImages(doc)).toThrow("文档引用的图片不存在");
  });
});

describe("exportSlides", () => {
  it("copies every image and draws a summary sheet", async () => {
    const doc = writeDoc("full.md", [
      "![项目名称](out/00-cover.png)",
      "## 一、第一章",
      "![第一张配图](out/01-agenda.png)",
      "![第二张配图](out/02-section.png)",
      "## 二、第二章",
      "![第三张配图](out/03-bullets.png)",
    ]);
    const { files, sheet } = await exportSlides(doc, join(dir, "full"), "样例");
    expect(files.map(file => basename(file))).toEqual([
      "00 项目名称.png",
      "01 第一张配图.png",
      "02 第二张配图.png",
      "03 第三张配图.png",
    ]);
    const [size] = await imageSizes([sheet]);
    expect(size?.width).toBe(CANVAS_WIDTH * SCALE);
  });

  it("keeps the summary sheet within the size image viewers show sharply", async () => {
    const many = join(dir, "many");
    mkdirSync(join(many, "out"), { recursive: true });
    const lines = Array.from({ length: 60 }, (_, index) => {
      const name = `${String(index).padStart(2, "0")}-page.png`;
      copyFileSync(join(dir, "out", "03-bullets.png"), join(many, "out", name));
      return `![第 ${index + 1} 张](out/${name})`;
    });
    writeFileSync(join(many, "many.md"), lines.join("\n\n"));
    const { files, sheet } = await exportSlides(join(many, "many.md"), join(many, "export"));
    expect(files).toHaveLength(60);
    const [size] = await imageSizes([sheet]);
    expect(Math.max(size?.width ?? Infinity, size?.height ?? Infinity)).toBeLessThanOrEqual(MAX_IMAGE_SIDE);
  });

  it("stops when the output folder already has files", async () => {
    const doc = writeDoc("again.md", ["![项目名称](out/00-cover.png)"]);
    const out = join(dir, "used");
    mkdirSync(out);
    writeFileSync(join(out, "old.png"), "");
    await expect(exportSlides(doc, out)).rejects.toThrow("输出目录里已经有文件");
  });
});
