type Writer = WritableStreamDefaultWriter<Uint8Array>;

const g = globalThis as any;
if (!g.__boardWriters) {
  g.__boardWriters = new Set<Writer>();
}
const writers: Set<Writer> = g.__boardWriters;
const enc = new TextEncoder();

export function addWriter(w: Writer) {
  writers.add(w);
}

export function removeWriter(w: Writer) {
  try {
    writers.delete(w);
  } catch {}
}

export function broadcastBoard(payload: unknown) {
  const data = enc.encode(`data: ${JSON.stringify(payload)}\n\n`);
  for (const w of Array.from(writers)) {
    try {
      w.write(data);
    } catch {
      writers.delete(w);
    }
  }
}

