// @env node
import { cpSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { onTestFinished } from "vitest";
import { stageStyle } from "./style.ts";

export function tempDir(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), `${prefix}-`));
  onTestFinished(() => rmSync(dir, { recursive: true }));
  return dir;
}

export function tempCopy(source: string): string {
  const dir = tempDir("copy");
  cpSync(source, dir, { recursive: true });
  return dir;
}

export function stagedStyle(style: string): string {
  const dir = tempDir(`style-${style}`);
  stageStyle(style, dir);
  return dir;
}
