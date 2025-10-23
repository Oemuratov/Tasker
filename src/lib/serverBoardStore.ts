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
  // Try GitHub-backed storage first if configured
  const gh = await ghRead();
  if (gh) return gh;
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
  const current = (await readState()) ?? { version: 0, nodes: [], edges: [] };
  const nextVersion = typeof version === "number" ? version : current.version + 1;
  const payload: PersistFile = { version: nextVersion, nodes, edges };
  // Try GitHub first if configured
  const wroteGh = await ghWrite(payload);
  if (wroteGh) return payload;
  await ensureDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(payload), "utf-8");
  return payload;
}

// ---------- Optional GitHub persistence (free + simple if token provided) ----------
const GH_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const GH_REPO = process.env.GITHUB_REPO || process.env.GH_REPO; // owner/name
const GH_PATH = process.env.GITHUB_PATH || process.env.GH_PATH || "taskboard.json";
const GH_BRANCH = process.env.GITHUB_BRANCH || process.env.GH_BRANCH || "main";

type GhCache = { sha?: string };
const g = globalThis as any;
if (!g.__ghCache) g.__ghCache = {} as GhCache;
const ghCache: GhCache = g.__ghCache;

async function ghRead(): Promise<PersistFile | null> {
  if (!GH_TOKEN || !GH_REPO) return null;
  try {
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${encodeURIComponent(GH_PATH)}?ref=${encodeURIComponent(GH_BRANCH)}`, {
      headers: {
        Authorization: `Bearer ${GH_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
      cache: "no-store" as any,
    });
    if (!res.ok) return null;
    const j: any = await res.json();
    ghCache.sha = j.sha;
    const content = Buffer.from(j.content, "base64").toString("utf-8");
    const parsed = JSON.parse(content) as PersistFile;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

async function ghWrite(payload: PersistFile): Promise<boolean> {
  if (!GH_TOKEN || !GH_REPO) return false;
  try {
    const content = Buffer.from(JSON.stringify(payload)).toString("base64");
    // Ensure we have latest sha
    if (!ghCache.sha) {
      await ghRead();
    }
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${encodeURIComponent(GH_PATH)}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GH_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "chore(taskboard): update board state",
        content,
        branch: GH_BRANCH,
        sha: ghCache.sha,
      }),
    });
    if (!res.ok) return false;
    const j: any = await res.json();
    ghCache.sha = j.content?.sha || ghCache.sha;
    return true;
  } catch {
    return false;
  }
}
