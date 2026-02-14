import { NextResponse } from "next/server";
import { searchKnowledge } from "@/lib/workspace";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const data = await searchKnowledge(query);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to search knowledge" }, { status: 500 });
  }
}
