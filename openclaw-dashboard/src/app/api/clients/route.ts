import { NextResponse } from "next/server";
import { getClients } from "@/lib/workspace";

export async function GET() {
  try {
    const data = await getClients();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}
