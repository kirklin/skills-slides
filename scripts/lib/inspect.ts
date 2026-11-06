// @env browser
import type { Finding, PageInspection } from "./types.ts";

interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface Stroke {
  el: Element;
  rect: Box;
}

interface Container {
  clips: boolean;
  rect: Box;
}

interface Glyph extends Box {
  ch: string;
}

interface Line {
  chars: string[];
  bottom: number;
}

// Runs inside the page through page.evaluate, so everything it needs has to live in this function body.
export function inspectPage(variables: readonly string[]): PageInspection {
  const root = getComputedStyle(document.documentElement);
  const [top, right, bottom, left] = variables.map((name) => {
    const value = root.getPropertyValue(name).trim();
    if (!value) {
      throw new Error(`页面没有定义 ${name}：风格的 style.css 要在 :root 里定义 ${variables.join("、")} 四个边距变量`);
    }
    return Number.parseFloat(value);
  });
  const area: Box = { left, top, right: window.innerWidth - right, bottom: window.innerHeight - bottom };
  const sides = ["top", "right", "bottom", "left"];

  const texts: string[] = [];
  const contents: string[] = [];
  const findings: Finding[] = [];
  const blocks = new Map<Element, Glyph[]>();
  const range = document.createRange();

  const clean = (text: string): string => text.replace(/\s+/g, " ").trim();
  const outside = (box: Box, frame: Box, slack: number): boolean =>
    box.left < frame.left - slack || box.top < frame.top - slack || box.right > frame.right + slack || box.bottom > frame.bottom + slack;
  const alpha = (color: string): number => color === "transparent" ? 0 : Number(/^rgba\(.*, ([\d.]+)\)$/.exec(color)?.[1] ?? 1);
  const visibleBorder = (style: CSSStyleDeclaration, minAlpha: number): boolean => sides.some(side =>
    style.getPropertyValue(`border-${side}-style`) !== "none"
    && Number.parseFloat(style.getPropertyValue(`border-${side}-width`)) > 0
    && alpha(style.getPropertyValue(`border-${side}-color`)) >= minAlpha);

  const strokes: Stroke[] = [...document.body.querySelectorAll("*")].filter((el) => {
    const rect = el.getBoundingClientRect();
    if (!(rect.width <= 4 && rect.height >= 24) && !(rect.height <= 4 && rect.width >= 24)) {
      return false;
    }
    const style = getComputedStyle(el);
    return alpha(style.backgroundColor) >= 0.2 || visibleBorder(style, 0.2);
  }).map(el => ({ el, rect: el.getBoundingClientRect() }));

  const crosses = (line: Stroke, glyph: Box): boolean => {
    const rect = line.rect;
    if (!(rect.left < glyph.right && rect.right > glyph.left && rect.top < glyph.bottom && rect.bottom > glyph.top)) {
      return false;
    }
    const x = (Math.max(rect.left, glyph.left) + Math.min(rect.right, glyph.right)) / 2;
    const y = (Math.max(rect.top, glyph.top) + Math.min(rect.bottom, glyph.bottom)) / 2;
    const stack = document.elementsFromPoint(x, y);
    const above = stack.slice(0, Math.max(stack.indexOf(line.el), 0));
    return !above.some(el => alpha(getComputedStyle(el).backgroundColor) === 1);
  };

  const containersOf = (node: Node): Container[] => {
    const containers: Container[] = [];
    for (let el = node.parentElement; el && el !== document.body; el = el.parentElement) {
      const style = getComputedStyle(el);
      const clips = style.overflowX !== "visible" || style.overflowY !== "visible";
      const painted = alpha(style.backgroundColor) > 0 || visibleBorder(style, Number.MIN_VALUE);
      if (clips || painted) {
        containers.push({ clips, rect: el.getBoundingClientRect() });
      }
    }
    return containers;
  };

  const blockOf = (node: Node): Element => {
    let el = node.parentElement ?? document.body;
    while (el !== document.body && ["inline", "contents"].includes(getComputedStyle(el).display)) {
      el = el.parentElement ?? document.body;
    }
    return el;
  };

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const parent = node.parentElement;
    const raw = node.textContent ?? "";
    const text = clean(raw);
    if (!parent || !text || parent.closest("style, script")) {
      continue;
    }
    contents.push(text);
    if (!parent.closest("[translate=\"no\"]")) {
      texts.push(text);
    }
    const size = Number.parseFloat(getComputedStyle(parent).fontSize);
    const containers = containersOf(node);
    const block = blockOf(node);
    const glyphs = blocks.get(block) ?? [];
    blocks.set(block, glyphs);
    const kinds = new Set<string>();
    let offset = 0;
    for (const ch of raw) {
      range.setStart(node, offset);
      range.setEnd(node, offset + ch.length);
      offset += ch.length;
      if (!ch.trim()) {
        continue;
      }
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        continue;
      }
      // Measure the em box: the font's ascent and descent reach beyond the line, but the ink does not.
      const middle = (rect.top + rect.bottom) / 2;
      const glyph: Glyph = { ch, left: rect.left, right: rect.right, top: middle - size / 2, bottom: middle + size / 2 };
      glyphs.push(glyph);
      if (outside(glyph, area, 2)) {
        kinds.add("文字超出四周的边距");
      }
      for (const container of containers) {
        if (outside(glyph, container.rect, 1)) {
          kinds.add(container.clips ? "文字被裁切" : "文字超出卡片");
        }
      }
      if (strokes.some(line => crosses(line, glyph))) {
        kinds.add("线穿过文字");
      }
    }
    for (const kind of kinds) {
      findings.push({ kind, text });
    }
  }

  for (const [block, glyphs] of blocks) {
    const lines: Line[] = [];
    for (const glyph of glyphs) {
      const line = lines.at(-1);
      if (line && (glyph.top + glyph.bottom) / 2 < line.bottom) {
        line.chars.push(glyph.ch);
        line.bottom = Math.max(line.bottom, glyph.bottom);
      } else {
        lines.push({ chars: [glyph.ch], bottom: glyph.bottom });
      }
    }
    const last = lines.at(-1)?.chars.filter(ch => /[\p{L}\p{N}]/u.test(ch)) ?? [];
    if (lines.length > 1 && last.length === 1) {
      findings.push({ kind: "最后一行只有一个字", text: clean(block.textContent ?? "") });
    }
  }

  for (const image of document.images) {
    if (!image.complete || image.naturalWidth === 0) {
      findings.push({ kind: "图片没有加载出来", text: image.getAttribute("src") ?? "" });
    }
  }

  // A page that uses a style's stylesheet must not restyle itself, or switching styles would break it.
  const own = document.querySelector("style");
  if (own && document.querySelector("link[rel=\"stylesheet\"]")) {
    findings.push({ kind: "页面里写了样式", text: clean(own.textContent ?? "").slice(0, 40) });
  }
  const boxes = [...document.querySelectorAll(".ph")].map(box => clean(box.textContent ?? "") || "占位框");
  return { texts, contents, boxes, findings };
}

export function collectTexts(): string[] {
  const texts: string[] = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const text = (walker.currentNode.textContent ?? "").replace(/\s+/g, " ").trim();
    if (text && !walker.currentNode.parentElement?.closest("style, script")) {
      texts.push(text);
    }
  }
  return texts;
}
