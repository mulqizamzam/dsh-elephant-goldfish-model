/**
 * DSH Elephant-Goldfish Model plugin entry.
 * Registers EGM skills via the skill-filesystem provider.
 * See cordis.patch.yml for the full Cordis composition.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));

export const name = "dsh-elephant-goldfish-model";
export const version = packageJson.version;
export const dshTarget = packageJson.engines.dsh;

export default Object.freeze({ name, version, dshTarget });
