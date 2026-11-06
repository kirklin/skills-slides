import type { TextRule } from "./types.ts";
import { fileURLToPath } from "node:url";

export const STYLES_DIR = fileURLToPath(new URL("../../assets/styles/", import.meta.url));

export const PAGES_DIR = fileURLToPath(new URL("../../assets/pages/", import.meta.url));

export const STYLE_HEADER = /^\/\* kirklin-slides style: ([a-z0-9-]+) \*\//;

export const LAYOUTS = [
  "cover",
  "agenda",
  "section",
  "bullets",
  "hero",
  "tiles",
  "compare",
  "matrix",
  "table",
  "bars",
  "columns",
  "line",
  "donut",
  "funnel",
  "timeline",
  "roadmap",
  "gantt",
  "tracks",
  "process",
  "quote",
  "image-text",
  "features",
  "team",
  "posts",
  "logos",
  "code",
  "closing",
] as const;

export const CANVAS_WIDTH = 1920;
export const CANVAS_HEIGHT = 1080;
export const SCALE = 2;

// Image viewers shrink pictures whose longer side exceeds this, so the summary sheet stays within it.
export const MAX_IMAGE_SIDE = 16384;

export const DEFAULT_CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

export const SAFE_AREA_VARIABLES = ["--safe-top", "--safe-right", "--safe-bottom", "--safe-left"] as const;

export const SHEET_NAME = "汇总.png";

export const MIN_PLACEHOLDER_LENGTH = 4;

export const TEXT_RULES: TextRule[] = [
  {
    kind: "中文和英文、数字之间缺空格",
    pattern: /\p{Script=Han}[A-Z0-9]|[A-Z0-9]\p{Script=Han}/giu,
    keep: match => !/^\d[年月日号]$|^[年月]\d$/u.test(match),
  },
  {
    kind: "汉字之间多了空格",
    pattern: /\p{Script=Han} +\p{Script=Han}/gu,
  },
  {
    kind: "中文旁边用了半角标点",
    pattern: /\p{Script=Han}[,.;:?!()]|[,;:?!()]\p{Script=Han}/gu,
  },
  {
    kind: "全角标点旁边多了空格",
    pattern: /[，。、；：？！」）] | [，。、；：？！「（]/gu,
  },
  {
    kind: "范围要写成「到」",
    pattern: /\d *[~～–—] *\d/gu,
  },
  {
    kind: "不用的词",
    pattern: /而是|落地|钉死|对齐|赋能|抓手|闭环|打通|颗粒度|底层逻辑|(?<!全)栈/gu,
  },
];
