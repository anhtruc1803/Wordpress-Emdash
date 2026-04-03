import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(currentDir, "../../../test-fixtures/fixtures");

export async function readFixture(name: string): Promise<string> {
  return readFile(resolve(fixturesDir, name), "utf8");
}

export async function readJsonFixture<T>(name: string): Promise<T> {
  const content = await readFixture(name);
  return JSON.parse(content) as T;
}
