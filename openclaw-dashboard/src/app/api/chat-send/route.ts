import { NextResponse } from "next/server";
import { sendChatMessage } from "@/lib/workspace";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;
    const result = await sendChatMessage(message);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
