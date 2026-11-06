import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { checkPages, checkText, listPages } from "./check.ts";
import { listStyles } from "./style.ts";
import { stagedStyle } from "./test-helpers.ts";

const fixtures = fileURLToPath(new URL("../fixtures/", import.meta.url));

describe("checkText", () => {
  it("leaves dates alone", () => {
    expect(checkText("10月21日发布，2026年11月上线")).toEqual([]);
  });

  it("reports a missing space between Chinese and numbers", () => {
    expect(checkText("第1周").map(finding => finding.match)).toEqual(["第1"]);
  });

  it("allows the job title and reports other uses of the banned character", () => {
    expect(checkText("全栈开发工程师")).toEqual([]);
    expect(checkText("使用的技术栈").map(finding => finding.kind)).toEqual(["不用的词"]);
  });
});

describe("checkPages", () => {
  it("reports every kind of problem on the bad page", async () => {
    const problems = await checkPages(listPages([join(fixtures, "bad/pages")]));
    expect(problems.map(({ kind, match, text }) => ({ kind, match, text }))).toMatchSnapshot();
  });

  it("takes the margins from the style", async () => {
    expect(await checkPages(listPages([join(fixtures, "narrow/pages")]))).toEqual([]);
  });

  it("stops when the style does not define its margins", async () => {
    await expect(checkPages(listPages([join(fixtures, "no-safe-area/pages")]))).rejects.toThrow("--safe-top");
  });

  it("reports sample text and placeholder boxes that were not replaced, and leaves numbers alone", async () => {
    const problems = await checkPages(listPages([join(fixtures, "leftover/pages")]));
    expect(problems.map(({ kind, text }) => ({ kind, text }))).toEqual([
      { kind: "样例的占位文字没有换掉", text: "指标一的说明" },
      { kind: "占位框还没有换掉", text: "图片" },
    ]);
  });

  it.each(listStyles())("finds nothing on any sample page in the %s style", async (style) => {
    expect(await checkPages(listPages([join(stagedStyle(style), "pages")]), { placeholders: false })).toEqual([]);
  });
});
