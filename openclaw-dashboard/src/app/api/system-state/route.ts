import { NextResponse } from "next/server";
import { getSystemState } from "@/lib/workspace";

export async function GET() {
  try {
    const data = await getSystemState();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch system state" }, { status: 500 });
  }
}
