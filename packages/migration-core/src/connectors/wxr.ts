import { readFile } from "node:fs/promises";

import type { WordPressSourceBundle } from "@wp2emdash/shared-types";

import { parseWxrXml } from "../parsers/wxr.js";

export async function loadWxrFile(filePath: string): Promise<WordPressSourceBundle> {
  const content = await readFile(filePath, "utf8");
  return parseWxrXml(content);
}
