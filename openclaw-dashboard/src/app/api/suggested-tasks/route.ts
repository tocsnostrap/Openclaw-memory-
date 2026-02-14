import { NextResponse } from "next/server";
import { getSuggestedTasks, updateTaskStatus } from "@/lib/workspace";

export async function GET() {
  try {
    const data = await getSuggestedTasks();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskId, status } = body;
    await updateTaskStatus(taskId, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
