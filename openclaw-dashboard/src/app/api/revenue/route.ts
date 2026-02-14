import { NextResponse } from "next/server";
import { getRevenue } from "@/lib/workspace";

export async function GET() {
  try {
    const data = await getRevenue();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch revenue" }, { status: 500 });
  }
}
