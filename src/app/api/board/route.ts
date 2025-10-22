import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type PersistFile = {
  version: number;
  nodes: unknown[];
  edges: unknown[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "board.json");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readState(): Promise<PersistFile | null> {
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

async function writeState(nodes: unknown[], edges: unknown[], version?: number) {
  await ensureDir();
  const current = (await readState()) ?? { version: 0, nodes: [], edges: [] };
  const nextVersion = typeof version === "number" ? version : current.version + 1;
  const payload: PersistFile = { version: nextVersion, nodes, edges };
  await fs.writeFile(DATA_FILE, JSON.stringify(payload), "utf-8");
  return payload;
}

export async function GET() {
  const state = (await readState()) ?? { version: 0, nodes: [], edges: [] };
  return NextResponse.json(state, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<PersistFile> & { nodes?: unknown[]; edges?: unknown[] };
    const nodes = Array.isArray(body.nodes) ? body.nodes : [];
    const edges = Array.isArray(body.edges) ? body.edges : [];
    const saved = await writeState(nodes, edges);
    return NextResponse.json(saved, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
}

