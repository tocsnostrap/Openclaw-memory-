import { NextResponse } from "next/server";
import { getSystemState } from "@/lib/workspace";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getSystemState();
    console.log('System state:', JSON.stringify(data));
    return NextResponse.json(data, { 
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: "Failed to fetch system state" }, { status: 500 });
  }
}
