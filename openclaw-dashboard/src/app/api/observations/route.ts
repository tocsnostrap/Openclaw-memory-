import { NextResponse } from "next/server";
import { getObservations } from "@/lib/workspace";

export async function GET() {
  try {
    const data = await getObservations();
    return NextResponse.json({ observations: data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch observations" }, { status: 500 });
  }
}
