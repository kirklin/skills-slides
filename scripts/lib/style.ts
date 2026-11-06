// @env node
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { PAGES_DIR, STYLE_HEADER, STYLES_DIR } from "./constants.ts";

export function listStyles(): string[] {
  return readdirSync(STYLES_DIR).filter(name => existsSync(join(STYLES_DIR, name, "style.css"))).sort();
}

export function styleDir(nameOrPath: string): string {
  const dir = existsSync(nameOrPath) ? resolve(nameOrPath) : join(STYLES_DIR, nameOrPath);
  if (!existsSync(join(dir, "style.css"))) {
    throw new Error(`找不到风格：${nameOrPath}，风格目录里要有 style.css`);
  }
  return dir;
}

export function styleName(dir: string): string {
  const name = STYLE_HEADER.exec(readFileSync(join(dir, "style.css"), "utf8"))?.[1];
  if (!name) {
    throw new Error(`${join(dir, "style.css")} 的第一行要写 /* kirklin-slides style: <风格名> */`);
  }
  return name;
}

export function layoutOf(file: string): string {
  return basename(file).replace(/^\d+-|\.html$/g, "");
}

export function samplePage(nameOrPath: string, layout: string): string {
  for (const dir of [join(styleDir(nameOrPath), "pages"), PAGES_DIR]) {
    const file = existsSync(dir) ? readdirSync(dir).find(name => layoutOf(name) === layout) : undefined;
    if (file) {
      return join(dir, file);
    }
  }
  throw new Error(`没有这种版式的样例：${layout}，可用的版式见 kirklin-slides-layouts.md`);
}

// Puts a style's stylesheet next to the shared sample pages; a style may replace single pages in its own pages/ folder.
export function stageStyle(nameOrPath: string, target: string): string[] {
  const dir = styleDir(nameOrPath);
  const pages = join(target, "pages");
  mkdirSync(pages, { recursive: true });
  cpSync(join(dir, "style.css"), join(target, "style.css"));
  cpSync(PAGES_DIR, pages, { recursive: true });
  if (existsSync(join(dir, "pages"))) {
    cpSync(join(dir, "pages"), pages, { recursive: true });
  }
  return readdirSync(pages).filter(name => name.endsWith(".html")).sort();
}

export function useStyle(nameOrPath: string, slidesDir: string): string {
  const target = join(resolve(slidesDir), "style.css");
  if (existsSync(target)) {
    throw new Error(`${target} 已经存在；换风格时先把它移到废纸篓`);
  }
  mkdirSync(join(resolve(slidesDir), "pages"), { recursive: true });
  cpSync(join(styleDir(nameOrPath), "style.css"), target);
  return target;
}

export function addPage(slidesDir: string, layout: string, name: string): string {
  const dir = resolve(slidesDir);
  const page = basename(name, ".html");
  if (!/^\d{2,3}-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page)) {
    throw new Error(`页面名要写成「序号-英文短词」，例如 03-plan：${name}`);
  }
  const target = join(dir, "pages", `${page}.html`);
  if (existsSync(target)) {
    throw new Error(`页面已经存在：${target}`);
  }
  const source = samplePage(styleName(dir), layout);
  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target);
  return target;
}
