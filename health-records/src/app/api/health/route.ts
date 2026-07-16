import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ status: "ok", service: "carevault", timestamp: new Date().toISOString() });
}
