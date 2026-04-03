import type { ImportPlan } from "@wp2emdash/shared-types";

export interface EmDashTargetAdapterResult {
  mode: "planned" | "imported";
  note: string;
}

export interface EmDashTargetAdapter {
  execute(plan: ImportPlan, target: string): Promise<EmDashTargetAdapterResult>;
}

export class PlanningOnlyEmDashTargetAdapter implements EmDashTargetAdapter {
  async execute(plan: ImportPlan, target: string): Promise<EmDashTargetAdapterResult> {
    return {
      mode: "planned",
      note: `Generated import plan for ${plan.entriesToCreate.length} entries targeting ${target}. No live EmDash import adapter is configured yet.`
    };
  }
}
