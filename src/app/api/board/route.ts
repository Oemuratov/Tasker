import { NextRequest, NextResponse } from "next/server";
import { broadcastBoard } from "@/lib/sseBus";
import { readStateWithInfo, writeStateWithInfo, type PersistFile } from "@/lib/serverBoardStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { state, backend } = await readStateWithInfo();
  const payload = state ?? { version: 0, nodes: [], edges: [] };
  return NextResponse.json({ ...payload, backend }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<PersistFile> & { nodes?: unknown[]; edges?: unknown[] };
    const nodes = Array.isArray(body.nodes) ? body.nodes : [];
    const edges = Array.isArray(body.edges) ? body.edges : [];
    // Authorization by cookie only
    const cookieOk = req.cookies.get("tb_auth")?.value === "1";
    if (!cookieOk) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const { saved, backend } = await writeStateWithInfo(nodes, edges);
    // Notify subscribers via SSE
    try {
      broadcastBoard(saved);
    } catch {}
    return NextResponse.json({ ...saved, backend }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
}
