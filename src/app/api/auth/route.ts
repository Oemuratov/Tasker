import { NextRequest, NextResponse } from "next/server";
import { getClientIp, readAllowed, writeAllowed } from "@/lib/authServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PASSWORD = "Hero1114";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const allowed = await readAllowed();
  const ok = !!allowed[ip];
  return NextResponse.json({ authorized: ok, ip });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  try {
    const body = (await req.json()) as { password?: string };
    if (body.password !== PASSWORD) {
      return NextResponse.json({ authorized: false }, { status: 401 });
    }
    const allowed = await readAllowed();
    allowed[ip] = true;
    await writeAllowed(allowed);
    return NextResponse.json({ authorized: true, ip });
  } catch {
    return NextResponse.json({ authorized: false }, { status: 400 });
  }
}

