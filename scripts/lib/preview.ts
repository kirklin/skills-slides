// @env node
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { renderPages } from "./render.ts";
import { drawSheet } from "./sheet.ts";
import { stageStyle, styleDir, styleName } from "./style.ts";

export async function previewStyle(nameOrPath: string, target: string): Promise<void> {
  const name = styleName(styleDir(nameOrPath));
  const work = mkdtempSync(join(tmpdir(), "slides-preview-"));
  try {
    stageStyle(nameOrPath, work);
    const outputs = await renderPages(work);
    await drawSheet(target, `${name} 的样例`, `共 ${outputs.length} 页，每种版式一页，名字后半段是版式的英文名。`, outputs.map((file) => {
      const [number = "", ...layout] = basename(file, ".png").split("-");
      return { file, number, title: layout.join("-"), note: "" };
    }));
  } finally {
    rmSync(work, { recursive: true });
  }
}
