export type Role = "operator" | "plant_supervisor" | "supervisor";

export type MachineStatus = "active" | "maintenance" | "out_of_service";

export type CheckItem = {
  id: string;
  label: string;
  ok: boolean | null;
  note: string;
};

export type PrestartCheck = {
  id: string;
  machineId: string;
  operatorId: string;
  shift: "Day" | "Night";
  hoursReading: string;
  daTest: {
    completed: boolean;
    result: "pass" | "fail" | "not_required" | "";
    note: string;
    supervisorVerified: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
  };
  items: CheckItem[];
  overallStatus: "pass" | "fail";
  generalNotes: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewNote?: string;
};

export type BreakdownStatus = "open" | "in_progress" | "resolved";

export type BreakdownReport = {
  id: string;
  machineId: string;
  reportedBy: string;
  severity: "low" | "medium" | "high";
  description: string;
  status: BreakdownStatus;
  createdAt: string;
  updatedAt: string;
  supervisorNote?: string;
};

export type Machine = {
  id: string;
  name: string;
  type: string;
  location: string;
  status: MachineStatus;
  dangerTag?: {
    active: boolean;
    reason: string;
    taggedBy: string;
    taggedAt: string;
  };
};

export type Operator = {
  id: string;
  name: string;
  role: "operator";
};

export type TimesheetEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  operatorId: string;
  machineId: string;
  shift: "Day" | "Night";
  startTime: string;
  endTime: string;
  breakMinutes: number;
  loadCount: number;
  material?: string;
  notes: string;
  submittedAt: string;
};

export type AlertNotice = {
  id: string;
  kind: "weather" | "work_change";
  level: "info" | "warning" | "critical";
  title: string;
  message: string;
  workImpact: string;
  active: boolean;
  createdAt: string;
};

export type PrestartStore = {
  machines: Machine[];
  operators: Operator[];
  checks: PrestartCheck[];
  breakdowns: BreakdownReport[];
  timesheets: TimesheetEntry[];
  alerts: AlertNotice[];
};

export const checklistTemplate: string[] = [
  "Pre-start documentation and permits in place",
  "Walk-around inspection completed (no visible damage/leaks)",
  "Tyres/tracks and undercarriage condition acceptable",
  "Fluids checked (fuel, oil, coolant, hydraulic)",
  "Brakes, steering, and controls functioning",
  "Lights, alarms, horn, and reversing systems working",
  "Guards, safety devices, and access points secure",
  "Fire extinguisher and emergency equipment present",
  "Communication device/radio checked",
  "Work area hazards identified and controlled",
];