import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PASSWORD = "Hero1114";

export async function GET(req: NextRequest) {
  const cookieOk = req.cookies.get("tb_auth")?.value === "1";
  return NextResponse.json({ authorized: cookieOk });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { password?: string };
    if (body.password !== PASSWORD) {
      return NextResponse.json({ authorized: false }, { status: 401 });
    }
    const res = NextResponse.json({ authorized: true });
    res.headers.set(
      "Set-Cookie",
      "tb_auth=1; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax"
    );
    return res;
  } catch {
    return NextResponse.json({ authorized: false }, { status: 400 });
  }
}
