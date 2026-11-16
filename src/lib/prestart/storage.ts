import { seedStore, STORAGE_KEY } from "./seed";
import type { PrestartStore } from "./types";

export function loadStore(): PrestartStore {
  if (typeof window === "undefined") return seedStore;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedStore));
      return seedStore;
    }
    const parsed = JSON.parse(raw) as PrestartStore;
    if (!parsed.machines || !parsed.operators || !parsed.checks || !parsed.breakdowns) {
      return seedStore;
    }
    parsed.checks = parsed.checks.map((c) => ({
      ...c,
      daTest: {
        completed: c.daTest?.completed ?? false,
        result: c.daTest?.result ?? "",
        note: c.daTest?.note ?? "",
        supervisorVerified: c.daTest?.supervisorVerified ?? false,
        verifiedBy: c.daTest?.verifiedBy,
        verifiedAt: c.daTest?.verifiedAt,
      },
    }));
    parsed.machines = parsed.machines.map((m) => ({ ...m, dangerTag: m.dangerTag ?? undefined }));
    parsed.timesheets = (parsed.timesheets ?? []).map((t) => ({
      material: "",
      ...t,
      breakMinutes: Number(t.breakMinutes ?? 0),
      loadCount: Number(t.loadCount ?? 0),
    }));
    parsed.alerts = parsed.alerts ?? seedStore.alerts;
    return parsed;
  } catch {
    return seedStore;
  }
}

export function saveStore(store: PrestartStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}