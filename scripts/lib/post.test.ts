import { describe, expect, it } from "vitest";
import { parsePosts, postId, shootPosts } from "./post.ts";

describe("postId", () => {
  it("accepts a bare post number", () => {
    expect(postId("1234567890123456789")).toBe("1234567890123456789");
  });

  it("reads the post number from a link", () => {
    expect(postId("https://example.com/someone/status/1234567890123456789?s=20")).toBe("1234567890123456789");
  });

  it("stops when the link has no post number", () => {
    expect(() => postId("https://example.com/home")).toThrow("链接里没有帖子编号");
  });
});

describe("parsePosts", () => {
  it("splits the file name from the link", () => {
    expect(parsePosts(["post-1=1234567890123456789"])).toEqual([{ name: "post-1", id: "1234567890123456789" }]);
  });

  it("stops when an item has no name", () => {
    expect(() => parsePosts(["=1234567890123456789"])).toThrow("参数要写成 名称=帖子链接");
  });
});

describe("shootPosts", () => {
  it("stops before opening a browser when the theme is unknown", async () => {
    await expect(shootPosts("unused", [], { theme: "blue", lang: "zh-cn", timezone: "Asia/Shanghai" })).rejects.toThrow("POST_THEME");
  });
});
