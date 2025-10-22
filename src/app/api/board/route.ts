import { NextRequest, NextResponse } from "next/server";
import { broadcastBoard } from "@/lib/sseBus";
import { readState, writeState, type PersistFile } from "@/lib/serverBoardStore";
import { getClientIp, readAllowed } from "@/lib/authServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const state = (await readState()) ?? { version: 0, nodes: [], edges: [] };
  return NextResponse.json(state, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<PersistFile> & { nodes?: unknown[]; edges?: unknown[] };
    const nodes = Array.isArray(body.nodes) ? body.nodes : [];
    const edges = Array.isArray(body.edges) ? body.edges : [];
    // Authorization by IP
    const ip = getClientIp(req.headers);
    const allowed = await readAllowed();
    if (!allowed[ip]) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const saved = await writeState(nodes, edges);
    // Notify subscribers via SSE
    try {
      broadcastBoard(saved);
    } catch {}
    return NextResponse.json(saved, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
}
