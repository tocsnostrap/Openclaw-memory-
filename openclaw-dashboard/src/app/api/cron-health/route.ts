import { NextResponse } from "next/server";
import { getCronHealth } from "@/lib/workspace";

export async function GET() {
  try {
    const data = await getCronHealth();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch cron health" }, { status: 500 });
  }
}
