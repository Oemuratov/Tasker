"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useBoardStore } from "@/store/useBoardStore";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function ManualSyncBar() {
  const setAll = useBoardStore((s) => s.setAll);
  const nodes = useBoardStore((s) => s.nodes);
  const edges = useBoardStore((s) => s.edges);

  const [pwOpen, setPwOpen] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState<"pull" | "push" | null>(null);

  const pull = async () => {
    setBusy("pull");
    try {
      const res = await fetch("/api/board", { cache: "no-store" });
      const j = await res.json();
      const n = Array.isArray(j.nodes) ? j.nodes : [];
      const e = Array.isArray(j.edges) ? j.edges : [];
      setAll(n, e);
    } finally {
      setBusy(null);
    }
  };

  const ensureAuth = async () => {
    const st = await fetch("/api/auth", { cache: "no-store" });
    const j = await st.json();
    if (j.authorized) return true;
    setPwOpen(true);
    return false;
  };

  const tryAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (r.ok) {
      setPwOpen(false);
      setPassword("");
      await push();
    }
  };

  const push = async () => {
    const authed = await ensureAuth();
    if (!authed) return;
    setBusy("push");
    try {
      await fetch("/api/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, edges }),
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <div className="fixed top-6 left-6 flex gap-2">
        <Button onClick={pull} aria-label="Получить данные с сервера" disabled={busy !== null}>
          Получить
        </Button>
        <Button onClick={push} aria-label="Загрузить данные на сервер" disabled={busy !== null}>
          Загрузить
        </Button>
      </div>

      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <form onSubmit={tryAuthorize}>
          <DialogHeader>Введите пароль</DialogHeader>
          <div className="grid gap-2">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Пароль"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setPwOpen(false)}>
              Отмена
            </Button>
            <Button type="submit">Ок</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}
