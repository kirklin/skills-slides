import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LAYOUTS, PAGES_DIR, STYLES_DIR } from "./constants.ts";
import { addPage, layoutOf, listStyles, samplePage, styleDir, styleName, useStyle } from "./style.ts";
import { tempDir } from "./test-helpers.ts";

const sharedPages = readdirSync(PAGES_DIR).filter(name => name.endsWith(".html")).sort();

describe("the shared sample pages", () => {
  it("cover every layout in the catalogue once", () => {
    expect(sharedPages.map(layoutOf).sort()).toEqual([...LAYOUTS].sort());
  });

  it("are numbered in the catalogue order", () => {
    expect(sharedPages).toEqual(LAYOUTS.map((layout, index) => `${String(index).padStart(2, "0")}-${layout}.html`));
  });
});

describe.each(listStyles())("the %s style", (style) => {
  it("names itself in the first line of style.css", () => {
    expect(styleName(styleDir(style))).toBe(style);
  });

  it("only replaces pages of layouts in the catalogue", () => {
    const own = join(STYLES_DIR, style, "pages");
    const replaced = existsSync(own) ? readdirSync(own).map(layoutOf) : [];
    expect(LAYOUTS).toEqual(expect.arrayContaining(replaced));
  });
});

describe("samplePage", () => {
  it("uses the shared page when the style has no page of its own", () => {
    expect(samplePage("launch-dark", "tiles")).toBe(join(PAGES_DIR, "05-tiles.html"));
  });

  it("prefers the page in the style's own folder", () => {
    const style = tempDir("style");
    mkdirSync(join(style, "pages"));
    writeFileSync(join(style, "style.css"), "/* kirklin-slides style: test-own */\n");
    writeFileSync(join(style, "pages", "05-tiles.html"), "<p>own</p>\n");
    expect(samplePage(style, "tiles")).toBe(join(style, "pages", "05-tiles.html"));
  });

  it("stops for a layout that is not in the catalogue", () => {
    expect(() => samplePage("launch-dark", "no-such-layout")).toThrow("没有这种版式的样例");
  });
});

describe("useStyle and addPage", () => {
  it("copy the stylesheet and a sample page into a project", () => {
    const dir = tempDir("project");
    useStyle("launch-dark", dir);
    expect(readFileSync(join(dir, "style.css"), "utf8")).toBe(readFileSync(join(STYLES_DIR, "launch-dark", "style.css"), "utf8"));
    const page = addPage(dir, "tiles", "03-status");
    expect(page).toBe(join(dir, "pages", "03-status.html"));
    expect(readFileSync(page, "utf8")).toBe(readFileSync(join(PAGES_DIR, "05-tiles.html"), "utf8"));
  });

  it("refuse to overwrite files that already exist", () => {
    const dir = tempDir("project");
    useStyle("launch-dark", dir);
    expect(() => useStyle("launch-dark", dir)).toThrow("已经存在");
    addPage(dir, "cover", "00-cover");
    expect(() => addPage(dir, "cover", "00-cover")).toThrow("页面已经存在");
  });

  it("require page names that start with a number", () => {
    const dir = tempDir("project");
    useStyle("launch-dark", dir);
    expect(() => addPage(dir, "tiles", "status")).toThrow("序号-英文短词");
  });
});
