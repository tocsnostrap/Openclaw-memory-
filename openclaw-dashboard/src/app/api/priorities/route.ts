import { NextResponse } from "next/server";
import { getPriorities } from "@/lib/workspace";

export async function GET() {
  try {
    const data = await getPriorities();
    return NextResponse.json({ priorities: data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch priorities" }, { status: 500 });
  }
}
