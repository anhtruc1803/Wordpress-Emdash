import { NextResponse } from "next/server";

import { getDashboardData } from "@/lib/server/project-store";

export async function GET() {
  const dashboard = await getDashboardData();
  return NextResponse.json({ dashboard });
}
