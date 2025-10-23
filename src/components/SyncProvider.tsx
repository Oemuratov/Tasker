import { promises as fs } from "fs";
import path from "path";
import os from "os";

/**
 * Минимальный формат сохраняемого графа.
 */
export type PersistFile = {
  version: number;
  nodes: unknown[];
  edges: unknown[];
};

/**
 * Writable-путь:
 * - Vercel: только /tmp
 * - локально: папка проекта
 */
const baseDir =
  process.env.DATA_DIR || (process.env.VERCEL ? os.tmpdir() : process.cwd());
const DATA_DIR = path.join(baseDir, "data");
const DATA_FILE = path.join(DATA_DIR, "board.json");

/**
 * GitHub-параметры
 * repo — в формате "owner/name"
 */
const GH_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
const GH_REPO =
  process.env.GITHUB_REPO || process.env.GH_REPO || "Oemuratov/tasker-sync";
const GH_PATH =
  process.env.GITHUB_PATH || process.env.GH_PATH || "taskboard.json";
const GH_BRANCH =
  process.env.GITHUB_BRANCH || process.env.GH_BRANCH || "main";

type GhCache = { sha?: string };
const g = globalThis as unknown as { __ghCache?: GhCache };
if (!g.__ghCache) g.__ghCache = {};
const ghCache = g.__ghCache;

/**
 * Создание локальной директории
 */
export async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

/**
 * Прочитать состояние: GitHub → локальный файл (fallback)
 */
export async function readState(): Promise<PersistFile | null> {
  const gh = await ghRead();
  if (gh) return gh;

  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as PersistFile;
    if (!isValidPersist(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Записать состояние: GitHub → локальный файл (fallback)
 */
export async function writeState(
  nodes: unknown[],
  edges: unknown[],
  version?: number
): Promise<PersistFile> {
  const current = (await readState()) ?? { version: 0, nodes: [], edges: [] };
  const nextVersion = typeof version === "number" ? version : current.version + 1;
  const payload: PersistFile = { version: nextVersion, nodes, edges };

  const wroteGh = await ghWrite(payload);
  if (wroteGh) return payload;

  await ensureDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(payload), "utf-8");
  return payload;
}

/* --------------------------- GitHub persistence --------------------------- */

function isGhConfigured() {
  return Boolean(GH_TOKEN && GH_REPO && GH_PATH && GH_BRANCH);
}

function isValidPersist(x: any): x is PersistFile {
  return (
    x &&
    typeof x === "object" &&
    typeof x.version === "number" &&
    Array.isArray(x.nodes) &&
    Array.isArray(x.edges)
  );
}

/**
 * Чтение taskboard.json из GitHub (Contents API)
 * Требует: существующий файл/первый коммит в репозитории/ветке.
 */
async function ghRead(): Promise<PersistFile | null> {
  if (!isGhConfigured()) return null;

  try {
    const url = `https://api.github.com/repos/${GH_REPO}/contents/${encodeURIComponent(
      GH_PATH
    )}?ref=${encodeURIComponent(GH_BRANCH)}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GH_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "taskboard-sync",
      },
      cache: "no-store" as any,
    });

    if (!res.ok) return null;

    const j: any = await res.json();
    // Сохраняем sha для последующих обновлений
    ghCache.sha = j.sha;

    const content = Buffer.from(j.content, "base64").toString("utf-8");
    const parsed = JSON.parse(content);
    if (!isValidPersist(parsed)) return null;

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Запись taskboard.json в GitHub (PUT Contents API)
 * - Поддержка первого создания файла (без sha)
 * - retry на случай конфликта sha (409)
 */
async function ghWrite(payload: PersistFile): Promise<boolean> {
  if (!isGhConfigured()) return false;

  const attempt = async (): Promise<{ ok: boolean; status?: number }> => {
    const content = Buffer.from(JSON.stringify(payload, null, 2)).toString(
      "base64"
    );

    const body: any = {
      message: "chore(taskboard): update board state",
      content,
      branch: GH_BRANCH,
    };
    // sha передаём только если знаем, иначе создадим файл
    if (ghCache.sha) body.sha = ghCache.sha;

    const res = await fetch(
      `https://api.github.com/repos/${GH_REPO}/contents/${encodeURIComponent(
        GH_PATH
      )}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GH_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "taskboard-sync",
        },
        body: JSON.stringify(body),
      }
    );

    if (res.ok) {
      const j: any = await res.json();
      // Обновляем sha на актуальный после записи
      ghCache.sha = j.content?.sha || ghCache.sha;
      return { ok: true, status: res.status };
    }

    return { ok: false, status: res.status };
  };

  try {
    // 1-я попытка
    let r = await attempt();
    if (r.ok) return true;

    // Если конфликт sha (кто-то обновил файл), перечитываем sha и повторяем один раз
    if (r.status === 409) {
      await ghRead();
      r = await attempt();
      return r.ok;
    }

    return false;
  } catch {
    return false;
  }
}
