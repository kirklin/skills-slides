import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CANVAS_WIDTH, MAX_IMAGE_SIDE, SCALE } from "./constants.ts";
import { imageSizes } from "./image.ts";
import { previewStyle } from "./preview.ts";
import { listStyles, styleDir } from "./style.ts";
import { tempDir } from "./test-helpers.ts";

describe("previewStyle", () => {
  it.each(listStyles())("draws one sheet with every sample page in the %s style", async (style) => {
    const target = join(tempDir("preview"), `${style}.png`);
    await previewStyle(style, target);
    const [size] = await imageSizes([target]);
    expect(size?.width).toBe(CANVAS_WIDTH * SCALE);
    expect(size?.height).toBeLessThanOrEqual(MAX_IMAGE_SIDE);
    await expect(previewStyle(style, target)).rejects.toThrow("文件已经存在");
  });

  it("stops when the style does not exist", () => {
    expect(() => styleDir("no-such-style")).toThrow("找不到风格");
  });
});
