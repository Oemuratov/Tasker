import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const ALLOWED_FILE = path.join(DATA_DIR, "allowed.json");

export async function readAllowed(): Promise<Record<string, boolean>> {
  try {
    const raw = await fs.readFile(ALLOWED_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function writeAllowed(map: Record<string, boolean>) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(ALLOWED_FILE, JSON.stringify(map), "utf-8");
}

export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const xrip = headers.get("x-real-ip");
  if (xrip) return xrip.trim();
  return "local"; // dev fallback
}

