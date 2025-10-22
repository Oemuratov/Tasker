import { NextRequest, NextResponse } from "next/server";
import { getClientIp, readAllowed, writeAllowed } from "@/lib/authServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PASSWORD = "Hero1114";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const allowed = await readAllowed();
  const cookieOk = req.cookies.get("tb_auth")?.value === "1";
  const ok = cookieOk || !!allowed[ip];
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
    const res = NextResponse.json({ authorized: true, ip });
    res.headers.set(
      "Set-Cookie",
      "tb_auth=1; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax"
    );
    return res;
  } catch {
    return NextResponse.json({ authorized: false }, { status: 400 });
  }
}
