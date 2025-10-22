export const STORAGE_KEY = "taskboard/v1";

export type Persisted = {
  nodes: unknown[];
  edges: unknown[];
};

export function migrateOrInit(raw: string | null): Persisted {
  if (!raw) {
    return { nodes: [], edges: [] };
  }
  try {
    const parsed = JSON.parse(raw) as Persisted;
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
      return { nodes: [], edges: [] };
    }
    return parsed;
  } catch {
    return { nodes: [], edges: [] };
  }
}

