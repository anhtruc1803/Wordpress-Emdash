import { readFile } from "node:fs/promises";

export async function readArtifactPreview(path: string): Promise<string> {
  return readFile(path, "utf8");
}
