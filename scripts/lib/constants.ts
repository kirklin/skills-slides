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
