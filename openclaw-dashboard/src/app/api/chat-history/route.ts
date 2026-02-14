import { NextResponse } from "next/server";
import { getChatHistory } from "@/lib/workspace";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get("channel") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50");
    const data = await getChatHistory({ channel, limit });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 });
  }
}
