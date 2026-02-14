import { NextResponse } from "next/server";
import { getContentPipeline } from "@/lib/workspace";

export async function GET() {
  try {
    const data = await getContentPipeline();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch content pipeline" }, { status: 500 });
  }
}
