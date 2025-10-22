import { promises as fs } from "fs";
import path from "path";
import os from "os";

export type PersistFile = {
  version: number;
  nodes: unknown[];
  edges: unknown[];
};

// Choose a writable directory in serverless environments.
// - On Vercel, only /tmp is writable; use it.
// - Locally, use project /data.
const baseDir = process.env.DATA_DIR || (process.env.VERCEL ? os.tmpdir() : process.cwd());
const DATA_DIR = path.join(baseDir, "data");
const DATA_FILE = path.join(DATA_DIR, "board.json");

export async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readState(): Promise<PersistFile | null> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as PersistFile;
    if (!("version" in parsed)) return null;
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function writeState(nodes: unknown[], edges: unknown[], version?: number) {
  await ensureDir();
  const current = (await readState()) ?? { version: 0, nodes: [], edges: [] };
  const nextVersion = typeof version === "number" ? version : current.version + 1;
  const payload: PersistFile = { version: nextVersion, nodes, edges };
  await fs.writeFile(DATA_FILE, JSON.stringify(payload), "utf-8");
  return payload;
}
