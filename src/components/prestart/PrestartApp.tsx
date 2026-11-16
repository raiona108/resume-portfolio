"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { checklistTemplate, type AlertNotice, type BreakdownReport, type BreakdownStatus, type PrestartCheck, type PrestartStore, type Role, type TimesheetEntry } from "@/lib/prestart/types";
import { loadStore, saveStore, uid } from "@/lib/prestart/storage";

type Tab = "overview" | "operator" | "supervisor" | "breakdowns" | "timesheet" | "daily_summary" | "shift_calendar";

const roleLabels: Record<Role, string> = {
  operator: "Operator",
  plant_supervisor: "Plant Supervisor",
  supervisor: "Supervisor",
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function PrestartApp() {
  const [store, setStore] = useState<PrestartStore | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [role, setRole] = useState<Role>("operator");

  useEffect(() => {
    const timer = window.setTimeout(() => setStore(loadStore()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (store) saveStore(store);
  }, [store]);

  const stats = useMemo(() => {
    if (!store) return null;
    const openBreakdowns = store.breakdowns.filter((b) => b.status !== "resolved").length;
    const failedChecks = store.checks.filter((c) => c.overallStatus === "fail").length;
    const activeMachines = store.machines.filter((m) => m.status === "active").length;
    return { openBreakdowns, failedChecks, activeMachines, totalChecks: store.checks.length };
  }, [store]);

  if (!store || !stats) {
    return <div className="p-8 text-slate-300">Loading prestart demo...</div>;
  }

  function updateStore(updater: (prev: PrestartStore) => PrestartStore) {
    setStore((prev) => (prev ? updater(prev) : prev));
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <Link href="/" className="text-xs uppercase tracking-[0.2em] text-cyan-300 hover:text-cyan-200">← Portfolio</Link>
            <h1 className="mt-1 text-2xl font-bold">Prestart Check & Plant Operations (MVP Demo)</h1>
            <p className="text-sm text-slate-400">Operators submit prestarts and breakdowns • Supervisors review status and track issues (local demo data)</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-2">
            <span className="px-2 text-xs uppercase tracking-wide text-slate-400">View as</span>
            {(["operator", "plant_supervisor", "supervisor"] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`rounded-lg px-3 py-1.5 text-sm ${role === r ? "bg-cyan-400 text-slate-950 font-semibold" : "text-slate-300 hover:bg-slate-800"}`}
              >
                {roleLabels[r]}
              </button>
            ))}
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 pb-3">
          {([
            ["overview", "Overview"],
            ["operator", "Operator Prestart"],
            ["supervisor", "Supervisor Review"],
            ["breakdowns", "Machines & Breakdowns"],
            ["timesheet", "Timesheet & Loads"],
            ["daily_summary", "Daily Summary"],
            ["shift_calendar", "Shift Calendar"],
          ] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-full px-4 py-2 text-sm border ${tab === key ? "border-cyan-400 bg-cyan-400/10 text-cyan-200" : "border-slate-800 text-slate-300 hover:border-slate-600"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        <AlertTopNotice alerts={store.alerts ?? []} />
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active machines" value={stats.activeMachines} />
          <StatCard label="Prestart checks submitted" value={stats.totalChecks} />
          <StatCard label="Failed checks" value={stats.failedChecks} tone={stats.failedChecks > 0 ? "warn" : "ok"} />
          <StatCard label="Open breakdowns/issues" value={stats.openBreakdowns} tone={stats.openBreakdowns > 0 ? "warn" : "ok"} />
        </section>

        {tab === "overview" && <Overview store={store} role={role} />}
        {tab === "operator" && <OperatorView store={store} onSubmit={(check) => updateStore((s) => ({ ...s, checks: [check, ...s.checks] }))} />}
        {tab === "supervisor" && (
          <SupervisorView
            store={store}
            role={role}
            onReview={(checkId, note, reviewer) =>
              updateStore((s) => ({
                ...s,
                checks: s.checks.map((c) => (c.id === checkId ? { ...c, reviewNote: note, reviewedBy: reviewer } : c)),
              }))
            }
            onVerifyDA={(checkId, verified, reviewer) =>
              updateStore((s) => ({
                ...s,
                checks: s.checks.map((c) =>
                  c.id === checkId
                    ? {
                        ...c,
                        daTest: {
                          ...c.daTest,
                          supervisorVerified: verified,
                          verifiedBy: verified ? reviewer : undefined,
                          verifiedAt: verified ? new Date().toISOString() : undefined,
                        },
                      }
                    : c,
                ),
              }))
            }
          />
        )}
        {tab === "breakdowns" && (
          <BreakdownsView
            store={store}
            role={role}
            onAdd={(b, alert) =>
              updateStore((s) => ({
                ...s,
                breakdowns: [b, ...s.breakdowns],
                alerts: alert ? [alert, ...(s.alerts ?? [])] : (s.alerts ?? []),
              }))
            }
            onUpdate={(id, patch) =>
              updateStore((s) => ({
                ...s,
                breakdowns: s.breakdowns.map((b) => (b.id === id ? { ...b, ...patch, updatedAt: new Date().toISOString() } : b)),
              }))
            }
            onDangerTag={(machineId, tag, alert) =>
              updateStore((s) => ({
                ...s,
                machines: s.machines.map((m) =>
                  m.id === machineId
                    ? { ...m, status: tag.active ? "out_of_service" : "active", dangerTag: tag.active ? tag : { ...tag, active: false } }
                    : m,
                ),
                alerts: alert ? [alert, ...(s.alerts ?? [])] : (s.alerts ?? []),
              }))
            }
          />
        )}
        {tab === "timesheet" && (
          <TimesheetView
            store={store}
            onAdd={(entry) => updateStore((s) => ({ ...s, timesheets: [entry, ...(s.timesheets ?? [])] }))}
          />
        )}
        {tab === "daily_summary" && <DailySummaryView store={store} />}
        {tab === "shift_calendar" && <ShiftCalendarView store={store} />}
        <div id="alerts-section" className="scroll-mt-24">
          <AlertsBanner
            alerts={store.alerts ?? []}
            canManage={role === "plant_supervisor" || role === "supervisor"}
            onToggle={(id, active) => updateStore((s) => ({ ...s, alerts: (s.alerts ?? []).map((a) => (a.id === id ? { ...a, active } : a)) }))}
          />
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, tone = "neutral" }: { label: string; value: number; tone?: "neutral" | "ok" | "warn" }) {
  const toneClass = tone === "warn" ? "border-amber-500/40 bg-amber-500/10 text-amber-200" : tone === "ok" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-slate-800 bg-slate-900 text-slate-100";
  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <div className="text-sm text-slate-300">{label}</div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}

function Overview({ store, role }: { store: PrestartStore; role: Role }) {
  const recentChecks = store.checks.slice(0, 5);
  const openBreakdowns = store.breakdowns.filter((b) => b.status !== "resolved").slice(0, 5);
  const machineName = (id: string) => store.machines.find((m) => m.id === id)?.name ?? id;
  const operatorName = (id: string) => store.operators.find((o) => o.id === id)?.name ?? id;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Recent prestart checks" subtitle="Latest submissions from operators">
        <div className="space-y-3">
          {recentChecks.length === 0 && <Empty text="No prestart checks yet." />}
          {recentChecks.map((c) => (
            <div key={c.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium">{machineName(c.machineId)} <span className="text-slate-400">• {operatorName(c.operatorId)}</span></div>
                <div className="flex gap-2"><StatusPill ok={c.overallStatus === "pass"} /><span className={`rounded-full px-2 py-0.5 text-xs border ${c.daTest?.supervisorVerified && c.overallStatus === "pass" && (c.daTest.result === "pass" || c.daTest.result === "not_required") ? "border-emerald-500/40 text-emerald-200" : "border-amber-500/40 text-amber-200"}`}>{c.daTest?.supervisorVerified && c.overallStatus === "pass" && (c.daTest.result === "pass" || c.daTest.result === "not_required") ? "Cleared" : "Not cleared"}</span></div>
              </div>
              <div className="mt-1 text-xs text-slate-400">{c.shift} shift • Hours {c.hoursReading || "N/A"} • {formatDate(c.submittedAt)}</div>
              <div className="mt-2 text-xs text-slate-400">D&amp;A test: {c.daTest?.completed ? `Completed (${c.daTest.result || "result not set"})` : "Not recorded"} • Supervisor verification: {c.daTest?.supervisorVerified ? "Ticked" : "Required (no tick, no work)"}</div>
              {c.generalNotes && <div className="mt-1 text-sm text-slate-300">{c.generalNotes}</div>}
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Open breakdowns / issues" subtitle={role === "operator" ? "Reported issues visible to supervisors" : "Track and update issue status"}>
        <div className="space-y-3">
          {openBreakdowns.length === 0 && <Empty text="No open breakdowns." />}
          {openBreakdowns.map((b) => (
            <div key={b.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium">{machineName(b.machineId)} <span className="text-slate-400">• {b.severity.toUpperCase()}</span></div>
                <span className="rounded-full border border-slate-700 px-2 py-0.5 text-xs text-slate-300">{b.status.replace("_", " ")}</span>
              </div>
              <div className="mt-1 text-sm text-slate-300">{b.description}</div>
              <div className="mt-1 text-xs text-slate-400">Reported by {b.reportedBy} • {formatDate(b.createdAt)}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function OperatorView({ store, onSubmit }: { store: PrestartStore; onSubmit: (check: PrestartCheck) => void }) {
  const [machineId, setMachineId] = useState(store.machines[0]?.id ?? "");
  const [operatorId, setOperatorId] = useState(store.operators[0]?.id ?? "");
  const [shift, setShift] = useState<"Day" | "Night">("Day");
  const [hoursReading, setHoursReading] = useState("");
  const [daCompleted, setDaCompleted] = useState(false);
  const [daResult, setDaResult] = useState<"pass" | "fail" | "not_required" | "">("");
  const [daNote, setDaNote] = useState("");
  const [items, setItems] = useState(() => checklistTemplate.map((label, i) => ({ id: String(i), label, ok: null as boolean | null, note: "" })));
  const [generalNotes, setGeneralNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function setItem(id: string, patch: Partial<{ ok: boolean | null; note: string }>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!machineId || !operatorId) {
      setMessage("Select a machine and operator.");
      return;
    }
    if (!daCompleted || !daResult) {
      setMessage("Pre-shift D&A test must be completed and a result selected before submission.");
      return;
    }
    const normalized = items.map((it) => ({ ...it, ok: it.ok === null ? false : it.ok }));
    const checklistPass = normalized.every((it) => it.ok);
    const daPass = daResult === "pass" || daResult === "not_required";
    const overallStatus = checklistPass && daPass ? "pass" : "fail";
    const check: PrestartCheck = {
      id: uid("check"),
      machineId,
      operatorId,
      shift,
      hoursReading,
      daTest: { completed: daCompleted, result: daResult, note: daNote, supervisorVerified: false },
      items: normalized,
      overallStatus,
      generalNotes,
      submittedAt: new Date().toISOString(),
    };
    onSubmit(check);
    setItems(checklistTemplate.map((label, i) => ({ id: String(i), label, ok: null, note: "" })));
    setHoursReading("");
    setDaCompleted(false);
    setDaResult("");
    setDaNote("");
    setGeneralNotes("");
    setMessage(`Prestart submitted as ${overallStatus.toUpperCase()}. Supervisors can now review it.`);
  }

  return (
    <Panel title="Operator prestart checklist" subtitle="Complete and submit a prestart check for a machine">
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Operator">
            <select value={operatorId} onChange={(e) => setOperatorId(e.target.value)} className="input">
              {store.operators.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </Field>
          <Field label="Machine">
            <select value={machineId} onChange={(e) => setMachineId(e.target.value)} className="input">
              {store.machines.map((m) => <option key={m.id} value={m.id}>{m.name} — {m.type} ({m.status})</option>)}
            </select>
          </Field>
          <Field label="Shift">
            <select value={shift} onChange={(e) => setShift(e.target.value as "Day" | "Night")} className="input">
              <option>Day</option><option>Night</option>
            </select>
          </Field>
          <Field label="Hours / Odometer">
            <input value={hoursReading} onChange={(e) => setHoursReading(e.target.value)} className="input" placeholder="e.g. 4521" />
          </Field>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <label className="flex items-start gap-3">
              <input type="checkbox" checked={daCompleted} onChange={(e) => setDaCompleted(e.target.checked)} className="mt-1 h-4 w-4 accent-cyan-400" />
              <span>
                <div className="text-sm font-medium">Pre-shift D&amp;A test (Drug &amp; Alcohol) <span className="text-rose-300">*</span></div>
                <div className="text-xs text-slate-400">Mandatory: complete and record the result before submitting a prestart.</div>
              </span>
            </label>
            <select value={daResult} onChange={(e) => setDaResult(e.target.value as "pass" | "fail" | "not_required" | "")} disabled={!daCompleted} className="input max-w-[220px] text-sm disabled:opacity-50">
              <option value="">Select result (required)</option>
              <option value="pass">Completed - Pass</option>
              <option value="fail">Completed - Fail</option>
              <option value="not_required">Not required / N/A</option>
            </select>
          </div>
          <div className="mt-3">
            <input value={daNote} onChange={(e) => setDaNote(e.target.value)} className="input" placeholder="D&A test note (optional)" />
          </div>
        </div>

        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="grid gap-2 rounded-xl border border-slate-800 bg-slate-950/50 p-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <div className="text-sm">{item.label}</div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setItem(item.id, { ok: true })} className={`rounded-lg px-3 py-1 text-sm border ${item.ok === true ? "bg-emerald-500/20 border-emerald-400 text-emerald-200" : "border-slate-700 text-slate-300"}`}>OK</button>
                <button type="button" onClick={() => setItem(item.id, { ok: false })} className={`rounded-lg px-3 py-1 text-sm border ${item.ok === false ? "bg-rose-500/20 border-rose-400 text-rose-200" : "border-slate-700 text-slate-300"}`}>Fault</button>
              </div>
              <input value={item.note} onChange={(e) => setItem(item.id, { note: e.target.value })} className="input" placeholder="Note (optional, required if fault)" />
            </div>
          ))}
        </div>

        <Field label="General notes">
          <textarea value={generalNotes} onChange={(e) => setGeneralNotes(e.target.value)} className="input min-h-24" placeholder="Any additional observations..." />
        </Field>

        {message && <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-sm text-cyan-100">{message}</div>}
        <button type="submit" className="rounded-xl bg-cyan-400 px-5 py-2.5 font-semibold text-slate-950 hover:bg-cyan-300">Submit prestart check</button>
      </form>
    </Panel>
  );
}

function SupervisorView({ store, role, onReview, onVerifyDA }: { store: PrestartStore; role: Role; onReview: (id: string, note: string, reviewer: string) => void; onVerifyDA: (id: string, verified: boolean, reviewer: string) => void }) {
  const machineName = (id: string) => store.machines.find((m) => m.id === id)?.name ?? id;
  const operatorName = (id: string) => store.operators.find((o) => o.id === id)?.name ?? id;
  const canReview = role === "plant_supervisor" || role === "supervisor";
  const reviewer = roleLabels[role];

  return (
    <Panel title="Supervisor review" subtitle="View submitted prestart checks and add review notes">
      {!canReview && <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">Switch to Plant Supervisor or Supervisor to add review notes. (Demo role selector above)</div>}
      <div className="space-y-4">
        {store.checks.length === 0 && <Empty text="No checks submitted yet." />}
        {store.checks.map((c) => (
          <ReviewCard key={c.id} check={c} machineName={machineName(c.machineId)} operatorName={operatorName(c.operatorId)} canReview={canReview} reviewer={reviewer} onReview={(note) => onReview(c.id, note, reviewer)} onVerifyDA={(verified) => onVerifyDA(c.id, verified, reviewer)} />
        ))}
      </div>
    </Panel>
  );
}

function ReviewCard({ check, machineName, operatorName, canReview, reviewer, onReview, onVerifyDA }: { check: PrestartCheck; machineName: string; operatorName: string; canReview: boolean; reviewer: string; onReview: (note: string) => void; onVerifyDA: (verified: boolean) => void }) {
  const [note, setNote] = useState(check.reviewNote ?? "");
  const faults = check.items.filter((i) => !i.ok);
  const daCleared = check.daTest?.supervisorVerified && (check.daTest.result === "pass" || check.daTest.result === "not_required");
  const workCleared = check.overallStatus === "pass" && daCleared;
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{machineName} <span className="text-slate-400 font-normal">• {operatorName}</span></div>
          <div className="text-xs text-slate-400">{check.shift} shift • Hours {check.hoursReading || "N/A"} • Submitted {formatDate(check.submittedAt)}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill ok={check.overallStatus === "pass"} />
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold border ${workCleared ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/40" : "bg-amber-500/20 text-amber-200 border-amber-500/40"}`}>{workCleared ? "CLEARED FOR WORK" : "NOT CLEARED"}</span>
        </div>
      </div>
      <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
          <div><span className="text-slate-400">Pre-shift D&amp;A test: </span>{check.daTest?.completed ? `Completed (${check.daTest.result || "result not set"})` : "Not recorded"}{check.daTest?.note ? ` — ${check.daTest.note}` : ""}</div>
          <div className="mt-1 text-xs {check.daTest?.supervisorVerified ? 'text-emerald-300' : 'text-amber-300'}">{check.daTest?.supervisorVerified ? `Supervisor verified by ${check.daTest.verifiedBy || reviewer}${check.daTest.verifiedAt ? ` at ${formatDate(check.daTest.verifiedAt)}` : ""}` : "Supervisor D&A verification required (No tick, no work)"}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5"><span className="text-slate-400">General notes: </span>{check.generalNotes || "No general notes."}</div>
      </div>
      <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3">
        <label className="flex items-start gap-3">
          <input type="checkbox" checked={!!check.daTest?.supervisorVerified} disabled={!canReview} onChange={(e) => onVerifyDA(e.target.checked)} className="mt-1 h-4 w-4 accent-cyan-400 disabled:opacity-50" />
          <span>
            <div className="text-sm font-medium">Supervisor/Plant Supervisor D&amp;A result verification <span className="text-rose-300">*</span></div>
            <div className="text-xs text-slate-400">No tick, no work. Supervisors and above must confirm the D&amp;A test result before the operator is cleared for work.</div>
          </span>
        </label>
      </div>
      {faults.length > 0 && (
        <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3">
          <div className="text-sm font-medium text-rose-200">Fault items ({faults.length})</div>
          <ul className="mt-2 space-y-1 text-sm text-rose-100/90">
            {faults.map((f) => <li key={f.id}>• {f.label}{f.note ? ` — ${f.note}` : ""}</li>)}
          </ul>
        </div>
      )}
      <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
        <Field label={`Supervisor review note ${check.reviewedBy ? `(by ${check.reviewedBy})` : ""}`}>
          <input value={note} onChange={(e) => setNote(e.target.value)} className="input" placeholder={canReview ? "Add review note..." : "Review notes (supervisor only)"} disabled={!canReview} />
        </Field>
        <button disabled={!canReview} onClick={() => onReview(note)} className="h-10 rounded-lg bg-slate-100 px-4 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-40">Save note</button>
      </div>
    </div>
  );
}

function BreakdownsView({ store, role, onAdd, onUpdate, onDangerTag }: { store: PrestartStore; role: Role; onAdd: (b: BreakdownReport, alert?: AlertNotice) => void; onUpdate: (id: string, patch: Partial<BreakdownReport>) => void; onDangerTag: (machineId: string, tag: { active: boolean; reason: string; taggedBy: string; taggedAt: string }, alert?: AlertNotice) => void }) {
  const [machineId, setMachineId] = useState(store.machines[0]?.id ?? "");
  const [reportedBy, setReportedBy] = useState(store.operators[0]?.name ?? "");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const [description, setDescription] = useState("");
  const [dangerReason, setDangerReason] = useState("");
  const [dangerMachineId, setDangerMachineId] = useState(store.machines[0]?.id ?? "");
  const machineName = (id: string) => store.machines.find((m) => m.id === id)?.name ?? id;
  const machineLabel = (id: string) => {
    const m = store.machines.find((x) => x.id === id);
    return m ? `${m.name} (${m.type})` : id;
  };
  const canManage = role === "plant_supervisor" || role === "supervisor";
  const actor = roleLabels[role];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    const now = new Date().toISOString();
    const b: BreakdownReport = { id: uid("bd"), machineId, reportedBy, severity, description: description.trim(), status: "open", createdAt: now, updatedAt: now };
    const alert: AlertNotice | undefined = severity === "high" || true ? {
      id: uid("alert"),
      kind: "work_change",
      level: severity === "high" ? "critical" : "warning",
      title: `BREAKDOWN ALERT - ${machineLabel(machineId)}`,
      message: `New ${severity.toUpperCase()} breakdown reported by ${reportedBy}: ${description.trim()}`,
      workImpact: severity === "high"
        ? "Live alert to Supervisors & Plant Supervisors: stop/isolate machine if unsafe, assess hazard, and do not operate until cleared."
        : "Supervisors & Plant Supervisors: review issue, prioritize response, and update work plan if required.",
      active: true,
      createdAt: now,
    } : undefined;
    onAdd(b, alert);
    setDescription("");
  }

  function applyDangerTag(active: boolean) {
    const reason = dangerReason.trim() || (active ? "Danger tag out applied - unsafe to operate" : "Danger tag cleared");
    const tag = { active, reason, taggedBy: canManage ? actor : reportedBy || "Operator", taggedAt: new Date().toISOString() };
    const alert: AlertNotice | undefined = active ? {
      id: uid("alert"),
      kind: "work_change",
      level: "critical",
      title: `DANGER TAG OUT - ${machineLabel(dangerMachineId)}`,
      message: `Machine ${machineLabel(dangerMachineId)} has been danger tagged out by ${tag.taggedBy}. Reason: ${reason}`,
      workImpact: "NO TICK, NO WORK. Do not operate. Live alert to Supervisors & Plant Supervisors: isolate/secure the machine, investigate, and remove tag only when safe and authorized.",
      active: true,
      createdAt: tag.taggedAt,
    } : {
      id: uid("alert"),
      kind: "work_change",
      level: "info",
      title: `Danger tag cleared - ${machineLabel(dangerMachineId)}`,
      message: `Danger tag cleared by ${tag.taggedBy}.`,
      workImpact: "Machine may return to service only after required checks and supervisor approval.",
      active: true,
      createdAt: tag.taggedAt,
    };
    onDangerTag(dangerMachineId, tag, alert);
    setDangerReason("");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <Panel title="Machines & Danger Tag Out" subtitle="Track machine status and apply/remove danger tag out">
          <div className="space-y-3">
            {store.machines.map((m) => (
              <div key={m.id} className={`rounded-xl border p-3 ${m.dangerTag?.active ? "border-rose-500/50 bg-rose-500/10" : "border-slate-800 bg-slate-950/50"}`}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium">{m.name} <span className="text-slate-400">• {m.type}</span></div>
                    <div className="text-xs text-slate-400">{m.location}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs border ${m.status === "active" ? "border-emerald-500/40 text-emerald-200" : m.status === "maintenance" ? "border-amber-500/40 text-amber-200" : "border-rose-500/40 text-rose-200"}`}>{m.status.replace("_", " ")}</span>
                    {m.dangerTag?.active && <span className="rounded-full border border-rose-400/60 bg-rose-500/20 px-2 py-0.5 text-xs font-semibold text-rose-100">DANGER TAG OUT</span>}
                  </div>
                </div>
                {m.dangerTag?.active && (
                  <div className="mt-2 text-xs text-rose-100/90">Tagged by {m.dangerTag.taggedBy} • {formatDate(m.dangerTag.taggedAt)} — {m.dangerTag.reason}</div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-3">
            <div className="text-sm font-semibold text-rose-200">Danger Tag Out control</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Machine"><select value={dangerMachineId} onChange={(e) => setDangerMachineId(e.target.value)} className="input">{store.machines.map((m) => <option key={m.id} value={m.id}>{m.name} — {m.type}</option>)}</select></Field>
              <Field label="Tagged by / authority"><input value={canManage ? actor : reportedBy} readOnly className="input opacity-80" /></Field>
            </div>
            <Field label="Reason / hazard"><input value={dangerReason} onChange={(e) => setDangerReason(e.target.value)} className="input" placeholder="Describe hazard/reason for danger tag out" /></Field>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => applyDangerTag(true)} className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400">Apply Danger Tag Out (Live alert)</button>
              <button type="button" disabled={!canManage} onClick={() => applyDangerTag(false)} className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 disabled:opacity-40">Clear Danger Tag (Supervisor/Plant Supervisor)</button>
            </div>
            {!canManage && <div className="text-xs text-slate-400">Operators can apply a danger tag out. Only Supervisors/Plant Supervisors can clear it.</div>}
          </div>
        </Panel>
      </div>

      <div className="space-y-6">
        <Panel title="Log breakdown / issue" subtitle="Report issues and send live alerts to Supervisors & Plant Supervisors">
          <form onSubmit={submit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Machine"><select value={machineId} onChange={(e) => setMachineId(e.target.value)} className="input">{store.machines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></Field>
              <Field label="Reported by"><input value={reportedBy} onChange={(e) => setReportedBy(e.target.value)} className="input" /></Field>
            </div>
            <Field label="Severity">
              <select value={severity} onChange={(e) => setSeverity(e.target.value as "low" | "medium" | "high")} className="input"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High (critical live alert)</option></select>
            </Field>
            <Field label="Description"><textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input min-h-24" placeholder="Describe the breakdown or issue..." /></Field>
            <button type="submit" className="rounded-xl bg-cyan-400 px-5 py-2.5 font-semibold text-slate-950 hover:bg-cyan-300">Report issue &amp; send live alert</button>
          </form>
        </Panel>

        <Panel title="Breakdown tracking" subtitle="Update status and supervisor notes">
          {!canManage && <div className="mb-3 text-xs text-slate-400">Switch to a supervisor role to update status/notes.</div>}
          <div className="space-y-3">
            {store.breakdowns.map((b) => (
              <div key={b.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium">{machineName(b.machineId)} <span className="text-slate-400">• {b.severity.toUpperCase()}</span></div>
                  <select disabled={!canManage} value={b.status} onChange={(e) => onUpdate(b.id, { status: e.target.value as BreakdownStatus })} className="input max-w-[170px] py-1 text-sm disabled:opacity-50">
                    <option value="open">open</option><option value="in_progress">in_progress</option><option value="resolved">resolved</option>
                  </select>
                </div>
                <div className="mt-1 text-sm text-slate-300">{b.description}</div>
                <div className="mt-1 text-xs text-slate-400">Reported by {b.reportedBy} • {formatDate(b.createdAt)}</div>
                <div className="mt-2">
                  <input disabled={!canManage} defaultValue={b.supervisorNote ?? ""} onBlur={(e) => onUpdate(b.id, { supervisorNote: e.target.value })} className="input text-sm disabled:opacity-50" placeholder="Supervisor note (save on blur)" />
                </div>
              </div>
            ))}
            {store.breakdowns.length === 0 && <Empty text="No breakdowns reported." />}
          </div>
        </Panel>
      </div>
    </div>
  );
}
function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs uppercase tracking-wide text-slate-400">{label}</div>
      {children}
    </label>
  );
}

function StatusPill({ ok }: { ok: boolean }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ok ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/40" : "bg-rose-500/20 text-rose-200 border border-rose-500/40"}`}>{ok ? "PASS" : "FAIL"}</span>;
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-slate-800 p-4 text-sm text-slate-400">{text}</div>;
}


function calcHours(start: string, end: string, breakMinutes: number) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return 0;
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  mins -= Number(breakMinutes || 0);
  return Math.max(0, mins / 60);
}

function TimesheetView({ store, onAdd }: { store: PrestartStore; onAdd: (entry: TimesheetEntry) => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [operatorId, setOperatorId] = useState(store.operators[0]?.id ?? "");
  const [machineId, setMachineId] = useState(store.machines[0]?.id ?? "");
  const [shift, setShift] = useState<"Day" | "Night">("Day");
  const [startTime, setStartTime] = useState("06:00");
  const [endTime, setEndTime] = useState("16:00");
  const [breakMinutes, setBreakMinutes] = useState(30);
  const [loadCount, setLoadCount] = useState(0);
  const [material, setMaterial] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const timesheets = store.timesheets ?? [];
  const operatorName = (id: string) => store.operators.find((o) => o.id === id)?.name ?? id;
  const machineName = (id: string) => store.machines.find((m) => m.id === id)?.name ?? id;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !operatorId || !machineId || !startTime || !endTime) {
      setMessage("Date, operator, machine, start and end time are required.");
      return;
    }
    const entry: TimesheetEntry = {
      id: uid("ts"),
      date,
      operatorId,
      machineId,
      shift,
      startTime,
      endTime,
      breakMinutes: Number(breakMinutes || 0),
      loadCount: Number(loadCount || 0),
      material,
      notes,
      submittedAt: new Date().toISOString(),
    };
    onAdd(entry);
    setNotes("");
    setMaterial("");
    setLoadCount(0);
    setMessage("Timesheet/load entry saved.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Panel title="Timesheet & Load Count" subtitle="Record daily shift times and load counts per operator/machine">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Date"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" /></Field>
            <Field label="Shift"><select value={shift} onChange={(e) => setShift(e.target.value as "Day" | "Night")} className="input"><option>Day</option><option>Night</option></select></Field>
            <Field label="Operator"><select value={operatorId} onChange={(e) => setOperatorId(e.target.value)} className="input">{store.operators.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></Field>
            <Field label="Machine"><select value={machineId} onChange={(e) => setMachineId(e.target.value)} className="input">{store.machines.map((m) => <option key={m.id} value={m.id}>{m.name} — {m.type}</option>)}</select></Field>
            <Field label="Start time"><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="input" /></Field>
            <Field label="End time"><input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="input" /></Field>
            <Field label="Break (minutes)"><input type="number" min={0} value={breakMinutes} onChange={(e) => setBreakMinutes(Number(e.target.value))} className="input" /></Field>
            <Field label="Load count"><input type="number" min={0} value={loadCount} onChange={(e) => setLoadCount(Number(e.target.value))} className="input" /></Field>
          </div>
          <Field label="Material / load type (optional)"><input value={material} onChange={(e) => setMaterial(e.target.value)} className="input" placeholder="e.g. Ore, Waste, Topsoil" /></Field>
          <Field label="Notes"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input min-h-20" placeholder="Shift notes, delays, conditions..." /></Field>
          {message && <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-sm text-cyan-100">{message}</div>}
          <button type="submit" className="rounded-xl bg-cyan-400 px-5 py-2.5 font-semibold text-slate-950 hover:bg-cyan-300">Save timesheet entry</button>
        </form>
      </Panel>

      <Panel title="Recent entries" subtitle="Latest timesheet and load count records">
        <div className="space-y-3">
          {timesheets.length === 0 && <Empty text="No timesheet entries yet." />}
          {timesheets.slice(0, 12).map((t) => (
            <div key={t.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium">{operatorName(t.operatorId)} <span className="text-slate-400">• {machineName(t.machineId)}</span></div>
                <div className="text-xs text-slate-400">{t.date} • {t.shift}</div>
              </div>
              <div className="mt-1 text-sm text-slate-300">{t.startTime}–{t.endTime} • Break {t.breakMinutes}m • {calcHours(t.startTime, t.endTime, t.breakMinutes).toFixed(2)} hrs • Loads: <span className="font-semibold text-cyan-200">{t.loadCount}</span>{t.material ? ` (${t.material})` : ""}</div>
              {t.notes && <div className="mt-1 text-xs text-slate-400">{t.notes}</div>}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function DailySummaryView({ store }: { store: PrestartStore }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const timesheets = (store.timesheets ?? []).filter((t) => t.date === date);
  const checks = store.checks.filter((c) => (c.submittedAt || "").slice(0, 10) === date);
  const breakdowns = store.breakdowns.filter((b) => (b.createdAt || "").slice(0, 10) === date || (b.status !== "resolved" && (b.updatedAt || "").slice(0, 10) === date));
  const operatorName = (id: string) => store.operators.find((o) => o.id === id)?.name ?? id;
  const machineName = (id: string) => store.machines.find((m) => m.id === id)?.name ?? id;
  const machineLocation = (id: string) => store.machines.find((m) => m.id === id)?.location ?? "Unassigned area";

  const totalHours = timesheets.reduce((sum, t) => sum + calcHours(t.startTime, t.endTime, t.breakMinutes), 0);
  const totalLoads = timesheets.reduce((sum, t) => sum + Number(t.loadCount || 0), 0);
  const totalBreakMins = timesheets.reduce((sum, t) => sum + Number(t.breakMinutes || 0), 0);
  const operatorsWorked = new Set(timesheets.map((t) => t.operatorId)).size;
  const machinesUsed = new Set(timesheets.map((t) => t.machineId)).size;
  const failedChecks = checks.filter((c) => c.overallStatus === "fail").length;
  const clearedChecks = checks.filter((c) => c.overallStatus === "pass" && c.daTest?.supervisorVerified && (c.daTest.result === "pass" || c.daTest.result === "not_required")).length;

  const byOperator = Array.from(timesheets.reduce((map, t) => {
    const key = t.operatorId;
    const prev = map.get(key) || { operatorId: key, hours: 0, loads: 0, entries: 0, areas: new Set<string>() as Set<string>, machines: new Set<string>() as Set<string> };
    prev.hours += calcHours(t.startTime, t.endTime, t.breakMinutes);
    prev.loads += Number(t.loadCount || 0);
    prev.entries += 1;
    prev.areas.add(machineLocation(t.machineId));
    prev.machines.add(t.machineId);
    map.set(key, prev);
    return map;
  }, new Map<string, { operatorId: string; hours: number; loads: number; entries: number; areas: Set<string>; machines: Set<string> }>()).values());

  const byArea = Array.from(timesheets.reduce((map, t) => {
    const key = machineLocation(t.machineId);
    const prev = map.get(key) || { area: key, hours: 0, loads: 0, entries: 0, operators: new Set<string>() as Set<string>, machines: new Set<string>() as Set<string> };
    prev.hours += calcHours(t.startTime, t.endTime, t.breakMinutes);
    prev.loads += Number(t.loadCount || 0);
    prev.entries += 1;
    prev.operators.add(t.operatorId);
    prev.machines.add(t.machineId);
    map.set(key, prev);
    return map;
  }, new Map<string, { area: string; hours: number; loads: number; entries: number; operators: Set<string>; machines: Set<string> }>()).values());

  const operatorSummaries = byOperator.map((row) => {
    const entries = timesheets.filter((t) => t.operatorId === row.operatorId);
    const opChecks = checks.filter((c) => c.operatorId === row.operatorId);
    const opBreakdowns = breakdowns.filter((b) => b.reportedBy === operatorName(row.operatorId) || entries.some((e) => e.machineId === b.machineId));
    return { ...row, entriesList: entries, checks: opChecks, breakdowns: opBreakdowns };
  });

  return (
    <div className="space-y-6">
      <Panel title="Daily summary" subtitle="Timesheets, load counts, and operational activity for a selected day">
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Select date"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input max-w-[220px]" /></Field>
          <div className="text-sm text-slate-400">Showing summary for <span className="text-slate-200 font-medium">{date}</span></div>
        </div>
        <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total hours" value={Number(totalHours.toFixed(1))} />
          <StatCard label="Total loads" value={totalLoads} />
          <StatCard label="Operators worked" value={operatorsWorked} />
          <StatCard label="Machines used" value={machinesUsed} />
          <StatCard label="Working areas active" value={byArea.length} />
          <StatCard label="Prestarts submitted" value={checks.length} />
          <StatCard label="Cleared for work" value={clearedChecks} tone={clearedChecks === checks.length && checks.length > 0 ? "ok" : "neutral"} />
          <StatCard label="Failed checks / open issues" value={failedChecks + breakdowns.filter((b)=>b.status!=="resolved").length} tone={(failedChecks + breakdowns.filter((b)=>b.status!=="resolved").length) > 0 ? "warn" : "ok"} />
        </section>
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300">
          <div>Total break time: <span className="font-semibold text-slate-100">{totalBreakMins} minutes</span> • Timesheet entries: <span className="font-semibold text-slate-100">{timesheets.length}</span></div>
          <div className="mt-1 text-slate-400">Daily summary is allocated by working area and includes a separate summary for each operator.</div>
        </div>
      </Panel>

      <Panel title="Daily summary by working area" subtitle="Allocated totals for each working area (based on machine location)">
        <div className="space-y-3">
          {byArea.length === 0 && <Empty text="No working area data for this date." />}
          {byArea.map((row) => {
            const areaChecks = checks.filter((c) => machineLocation(c.machineId) === row.area);
            const areaBreakdowns = breakdowns.filter((b) => machineLocation(b.machineId) === row.area);
            return (
              <div key={row.area} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{row.area}</h3>
                    <div className="mt-1 text-xs text-slate-400">{row.operators.size} operator(s) • {row.machines.size} machine(s) • {row.entries} timesheet entr{row.entries === 1 ? "y" : "ies"}</div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="rounded-full border border-slate-700 px-3 py-1">{row.hours.toFixed(2)} hrs</span>
                    <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-cyan-200 font-semibold">{row.loads} loads</span>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-2.5">Prestarts: <span className="font-medium text-slate-100">{areaChecks.length}</span></div>
                  <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-2.5">Cleared: <span className="font-medium text-slate-100">{areaChecks.filter((c) => c.overallStatus === "pass" && c.daTest?.supervisorVerified && (c.daTest.result === "pass" || c.daTest.result === "not_required")).length}</span></div>
                  <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-2.5">Breakdowns/issues: <span className="font-medium text-slate-100">{areaBreakdowns.length}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Daily summary by operator" subtitle="Individual daily summary for each operator">
        <div className="space-y-4">
          {operatorSummaries.length === 0 && <Empty text="No operator summaries for this date." />}
          {operatorSummaries.map((op) => (
            <div key={op.operatorId} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{operatorName(op.operatorId)}</h3>
                  <div className="mt-1 text-xs text-slate-400">Areas: {Array.from(op.areas).join(", ") || "N/A"} • Machines: {Array.from(op.machines).map(machineName).join(", ") || "N/A"}</div>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full border border-slate-700 px-3 py-1">{op.hours.toFixed(2)} hrs</span>
                  <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-cyan-200 font-semibold">{op.loads} loads</span>
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-4">
                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-2.5">Entries: <span className="font-medium text-slate-100">{op.entries}</span></div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-2.5">Prestarts: <span className="font-medium text-slate-100">{op.checks.length}</span></div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-2.5">Cleared: <span className="font-medium text-slate-100">{op.checks.filter((c) => c.overallStatus === "pass" && c.daTest?.supervisorVerified && (c.daTest.result === "pass" || c.daTest.result === "not_required")).length}</span></div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-2.5">Related issues: <span className="font-medium text-slate-100">{op.breakdowns.length}</span></div>
              </div>
              <div className="mt-3 space-y-2">
                {op.entriesList.map((t) => (
                  <div key={t.id} className="rounded-lg border border-slate-800 bg-slate-900/40 p-2.5 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2"><span>{machineName(t.machineId)} • {machineLocation(t.machineId)} • {t.shift}</span><span className="text-slate-400">{t.startTime}-{t.endTime}</span></div>
                    <div className="mt-1 text-slate-300">{calcHours(t.startTime, t.endTime, t.breakMinutes).toFixed(2)} hrs • Break {t.breakMinutes}m • Loads {t.loadCount}{t.material ? ` (${t.material})` : ""}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}




function AlertsBanner({ alerts, canManage, onToggle }: { alerts: AlertNotice[]; canManage: boolean; onToggle: (id: string, active: boolean) => void }) {
  const activeAlerts = alerts.filter((a) => a.active);
  if (activeAlerts.length === 0) return null;
  const styles: Record<AlertNotice["level"], string> = {
    info: "border-cyan-500/40 bg-cyan-500/10 text-cyan-100",
    warning: "border-amber-500/40 bg-amber-500/10 text-amber-100",
    critical: "border-rose-500/40 bg-rose-500/10 text-rose-100",
  };
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Weather alerts, work changes & live safety alerts</h2>
        <span className="text-xs text-slate-400">Supervisors &amp; Plant Supervisors: review immediately before work continues</span>
      </div>
      {activeAlerts.map((a) => (
        <div key={a.id} className={`rounded-2xl border p-4 ${styles[a.level]}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-current/30 px-2 py-0.5 text-[11px] uppercase tracking-wide">{a.kind === "weather" ? "Weather alert" : "Work change"}</span>
                <span className="rounded-full border border-current/30 px-2 py-0.5 text-[11px] uppercase tracking-wide">{a.level}</span>
              </div>
              <h3 className="mt-2 text-lg font-semibold">{a.title}</h3>
              <p className="mt-1 text-sm opacity-95">{a.message}</p>
              <div className="mt-3 rounded-xl border border-current/20 bg-black/10 p-3 text-sm">
                <span className="font-semibold">Affected work / required changes: </span>{a.workImpact}
              </div>
            </div>
            {canManage && (
              <button onClick={() => onToggle(a.id, false)} className="rounded-lg border border-current/30 px-3 py-1.5 text-xs hover:bg-black/10">Dismiss</button>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}




function ShiftCalendarView({ store }: { store: PrestartStore }) {
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today.toISOString().slice(0, 10));
  const [shift, setShift] = useState<"Day" | "Night">("Day");
  const [area, setArea] = useState<string>("all");

  const operatorName = (id: string) => store.operators.find((o) => o.id === id)?.name ?? id;
  const machineName = (id: string) => store.machines.find((m) => m.id === id)?.name ?? id;
  const machineLocation = (id: string) => store.machines.find((m) => m.id === id)?.location ?? "Unassigned area";
  const areas = Array.from(new Set(store.machines.map((m) => m.location))).sort();

  const year = month.getFullYear();
  const mIdx = month.getMonth();
  const firstDay = new Date(year, mIdx, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, mIdx + 1, 0).getDate();
  const cells: Array<{ date: string | null; day?: number }> = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ date: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(mIdx + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ date, day: d });
  }

  function hasData(date: string) {
    const ts = (store.timesheets ?? []).some((t) => t.date === date);
    const ch = store.checks.some((c) => (c.submittedAt || "").slice(0, 10) === date);
    const bd = store.breakdowns.some((b) => (b.createdAt || "").slice(0, 10) === date);
    return ts || ch || bd;
  }

  const inArea = (machineId: string) => area === "all" || machineLocation(machineId) === area;
  const timesheets = (store.timesheets ?? []).filter((t) => t.date === selectedDate && t.shift === shift && inArea(t.machineId));
  const checks = store.checks.filter((c) => (c.submittedAt || "").slice(0, 10) === selectedDate && c.shift === shift && inArea(c.machineId));
  const breakdowns = store.breakdowns.filter((b) => ((b.createdAt || "").slice(0, 10) === selectedDate || b.status !== "resolved") && inArea(b.machineId));
  const shiftKey = `${selectedDate} | ${shift} shift${area !== "all" ? ` | ${area}` : " | All areas"}`;

  const totalHours = timesheets.reduce((sum, t) => sum + calcHours(t.startTime, t.endTime, t.breakMinutes), 0);
  const totalLoads = timesheets.reduce((sum, t) => sum + Number(t.loadCount || 0), 0);
  const failedChecks = checks.filter((c) => c.overallStatus === "fail").length;
  const cleared = checks.filter((c) => c.overallStatus === "pass" && c.daTest?.supervisorVerified && (c.daTest.result === "pass" || c.daTest.result === "not_required")).length;

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <Panel title="Interactive shift calendar" subtitle="Choose a date, then select a unique shift to check results">
        <div className="flex items-center justify-between gap-2">
          <button onClick={() => setMonth(new Date(year, mIdx - 1, 1))} className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-800">Prev</button>
          <div className="font-semibold">{month.toLocaleString(undefined, { month: "long", year: "numeric" })}</div>
          <button onClick={() => setMonth(new Date(year, mIdx + 1, 1))} className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-800">Next</button>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-slate-400">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d} className="py-1">{d}</div>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell.date) return <div key={`e-${i}`} className="h-10 rounded-lg" />;
            const selected = cell.date === selectedDate;
            const data = hasData(cell.date);
            return (
              <button key={cell.date} onClick={() => setSelectedDate(cell.date!)} className={`relative h-10 rounded-lg border text-sm transition ${selected ? "border-cyan-400 bg-cyan-400/20 text-cyan-100" : "border-slate-800 bg-slate-950/40 hover:border-slate-600"}`}>
                {cell.day}
                {data && <span className={`absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${selected ? "bg-cyan-300" : "bg-cyan-500"}`} />}
              </button>
            );
          })}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <Field label="Shift">
            <select value={shift} onChange={(e) => setShift(e.target.value as "Day" | "Night")} className="input"><option>Day</option><option>Night</option></select>
          </Field>
          <Field label="Working area">
            <select value={area} onChange={(e) => setArea(e.target.value)} className="input"><option value="all">All areas</option>{areas.map((a) => <option key={a} value={a}>{a}</option>)}</select>
          </Field>
        </div>
        <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-xs text-slate-400">Dots indicate dates with recorded prestarts, timesheets, or breakdown activity. Select a date and shift to view unique shift results.</div>
      </Panel>

      <div className="space-y-6">
        <Panel title="Shift results" subtitle={shiftKey}>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Hours (selected shift)" value={Number(totalHours.toFixed(1))} />
            <StatCard label="Loads (selected shift)" value={totalLoads} />
            <StatCard label="Prestarts" value={checks.length} />
            <StatCard label="Cleared for work" value={cleared} tone={cleared === checks.length && checks.length > 0 ? "ok" : "neutral"} />
            <StatCard label="Failed checks" value={failedChecks} tone={failedChecks > 0 ? "warn" : "ok"} />
            <StatCard label="Breakdowns/issues" value={breakdowns.length} tone={breakdowns.some((b)=>b.status!=="resolved") ? "warn" : "ok"} />
          </section>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Prestart results" subtitle="Checks for selected shift">
            <div className="space-y-2">
              {checks.length === 0 && <Empty text="No prestart checks for this shift." />}
              {checks.map((c) => (
                <div key={c.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2"><div className="font-medium">{machineName(c.machineId)} • {machineLocation(c.machineId)}</div><span className={`rounded-full px-2 py-0.5 text-xs border ${c.overallStatus === "pass" ? "border-emerald-500/40 text-emerald-200" : "border-rose-500/40 text-rose-200"}`}>{c.overallStatus}</span></div>
                  <div className="mt-1 text-slate-400">Operator: {operatorName(c.operatorId)} • D&amp;A: {c.daTest?.completed ? c.daTest.result : "not recorded"} • Supervisor: {c.daTest?.supervisorVerified ? "verified" : "pending"}</div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Timesheets & loads" subtitle="Entries for selected shift">
            <div className="space-y-2">
              {timesheets.length === 0 && <Empty text="No timesheet/load entries for this shift." />}
              {timesheets.map((t) => (
                <div key={t.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2"><div className="font-medium">{operatorName(t.operatorId)} • {machineName(t.machineId)}</div><div className="text-slate-400">{machineLocation(t.machineId)}</div></div>
                  <div className="mt-1 text-slate-300">{t.startTime}-{t.endTime} • {calcHours(t.startTime, t.endTime, t.breakMinutes).toFixed(2)} hrs • Loads {t.loadCount}{t.material ? ` (${t.material})` : ""}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel title="Breakdowns / issues affecting shift" subtitle="Open or same-day reported issues for selected area/shift context">
          <div className="space-y-2">
            {breakdowns.length === 0 && <Empty text="No breakdowns/issues for this selection." />}
            {breakdowns.map((b) => (
              <div key={b.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2"><div className="font-medium">{machineName(b.machineId)} • {machineLocation(b.machineId)}</div><span className="rounded-full border border-slate-700 px-2 py-0.5 text-xs">{b.status}</span></div>
                <div className="mt-1 text-slate-300">{b.description}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}




function AlertTopNotice({ alerts }: { alerts: AlertNotice[] }) {
  const active = alerts.filter((a) => a.active);
  if (active.length === 0) return null;
  const hasCritical = active.some((a) => a.level === "critical");
  return (
    <a
      href="#alerts-section"
      className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur ${hasCritical ? "border-rose-400/60 bg-rose-500/20 text-rose-50" : "border-amber-400/60 bg-amber-500/20 text-amber-50"}`}
    >
      <div className="flex items-center gap-3">
        <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-current/15 text-lg font-bold">
          !
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-30" />
        </span>
        <div>
          <div className="text-sm font-semibold uppercase tracking-wide">Active alerts ({active.length}) — review required</div>
          <div className="text-xs opacity-90">Weather, work changes, danger tag outs, or breakdown alerts are active. Tap to jump to alerts at bottom.</div>
        </div>
      </div>
      <span className="text-sm font-semibold whitespace-nowrap">View alerts ↓</span>
    </a>
  );
}

