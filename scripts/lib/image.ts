// @env node
import type { ImageSize } from "./types.ts";
import { pathToFileURL } from "node:url";
import { launchBrowser } from "./browser.ts";

export async function imageSizes(files: string[]): Promise<ImageSize[]> {
  const sizes: ImageSize[] = [];
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    for (const file of files) {
      await page.goto(pathToFileURL(file).href, { waitUntil: "load" });
      sizes.push(await page.evaluate(() => {
        const image = document.images[0];
        if (!image) {
          throw new Error("页面里没有图片");
        }
        return { width: image.naturalWidth, height: image.naturalHeight };
      }));
    }
  } finally {
    await browser.close();
  }
  return sizes;
}
