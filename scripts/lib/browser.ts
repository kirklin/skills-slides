// @env node
import type { Browser } from "puppeteer-core";
import process from "node:process";
import puppeteer from "puppeteer-core";
import { DEFAULT_CHROME } from "./constants.ts";

export function launchBrowser(): Promise<Browser> {
  return puppeteer.launch({
    executablePath: process.env.CHROME ?? DEFAULT_CHROME,
    headless: true,
  });
}
