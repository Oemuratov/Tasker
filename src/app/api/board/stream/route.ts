import { NextRequest } from "next/server";
import { addWriter, removeWriter } from "@/lib/sseBus";
import { readState } from "@/lib/serverBoardStore";

export async function GET(req: NextRequest) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  addWriter(writer);
  const enc = new TextEncoder();
  // Send initial state immediately
  const current = (await readState()) ?? { version: 0, nodes: [], edges: [] };
  await writer.write(enc.encode(`data: ${JSON.stringify(current)}\n\n`));
  // Close handling
  const interval = setInterval(async () => {
    try {
      await writer.write(enc.encode(`: ping\n\n`));
    } catch {
      clearInterval(interval);
    }
  }, 15000);

  const abort = () => {
    try {
      removeWriter(writer);
      writer.close();
    } catch {}
    clearInterval(interval);
  };
  req.signal.addEventListener("abort", abort, { once: true });
  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
