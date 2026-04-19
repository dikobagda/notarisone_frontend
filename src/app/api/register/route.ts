import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const backendRes = await fetch("http://localhost:3001/api/backauth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("[Proxy /api/register] Error:", err);
    return NextResponse.json(
      { success: false, message: "Backend tidak dapat dijangkau. Pastikan server backend berjalan." },
      { status: 503 }
    );
  }
}
