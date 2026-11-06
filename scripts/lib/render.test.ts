import { readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CANVAS_HEIGHT, CANVAS_WIDTH, SCALE } from "./constants.ts";
import { imageSizes } from "./image.ts";
import { renderPages, slidePages } from "./render.ts";
import { listStyles } from "./style.ts";
import { stagedStyle, tempCopy } from "./test-helpers.ts";

const fixtures = fileURLToPath(new URL("../fixtures/", import.meta.url));

describe("renderPages", () => {
  it.each(listStyles())("renders every sample page in the %s style at twice the canvas size", async (style) => {
    const dir = stagedStyle(style);
    const outputs = await renderPages(dir);
    const pages = readdirSync(join(dir, "pages")).sort();
    expect(outputs.map(file => basename(file, ".png"))).toEqual(pages.map(page => basename(page, ".html")));
    for (const size of await imageSizes(outputs)) {
      expect(size).toEqual({ width: CANVAS_WIDTH * SCALE, height: CANVAS_HEIGHT * SCALE });
    }
  });

  it("renders only the named pages", async () => {
    const outputs = await renderPages(stagedStyle("launch-dark"), ["00-cover", "06-compare.html"]);
    expect(outputs.map(file => basename(file))).toEqual(["00-cover.png", "06-compare.png"]);
  });

  it("stops when an image is missing", async () => {
    const dir = tempCopy(join(fixtures, "broken"));
    await expect(renderPages(dir, ["01-missing-image"])).rejects.toThrow(`${dir}/assets/missing.png`);
  });

  it("stops when the stylesheet is missing", async () => {
    const dir = tempCopy(join(fixtures, "broken"));
    await expect(renderPages(dir, ["02-missing-style"])).rejects.toThrow(`${dir}/missing.css`);
  });

  it("stops when a named page does not exist", () => {
    expect(() => slidePages(join(fixtures, "broken"), ["99-none"])).toThrow("页面不存在");
  });
});
