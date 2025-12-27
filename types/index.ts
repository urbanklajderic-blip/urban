// Core types for the 12-week identity transformation tracker

export type Phase = 1 | 2 | 3;

export type PhaseInfo = {
  id: Phase;
  name: string;
  weeks: number[];
  goals: string[];
  workoutsPerWeek: number;
};

export const PHASES: Record<Phase, PhaseInfo> = {
  1: {
    id: 1,
    name: "Stabilization",
    weeks: [1, 2, 3, 4],
    goals: [
      "Establish baseline habits",
      "Daily identity writing",
      "3x weekly training",
      "Track mismatches consistently"
    ],
    workoutsPerWeek: 3
  },
  2: {
    id: 2,
    name: "Identity Weighting",
    weeks: [5, 6, 7, 8],
    goals: [
      "Deepen identity alignment",
      "2 mismatch audits daily",
      "3 microproof bullets nightly",
      "4x weekly training",
      "Weekly CEO reviews"
    ],
    workoutsPerWeek: 4
  },
  3: {
    id: 3,
    name: "Autopilot Install",
    weeks: [9, 10, 11, 12],
    goals: [
      "Lock in automatic patterns",
      "Structured training schedule",
      "Systems optimization",
      "Final decommissioning prep"
    ],
    workoutsPerWeek: 4
  }
};

export function getCurrentPhase(week: number): Phase {
  if (week <= 4) return 1;
  if (week <= 8) return 2;
  return 3;
}

export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
