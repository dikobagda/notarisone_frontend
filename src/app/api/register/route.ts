import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    if (!backendUrl) {
      throw new Error("NEXT_PUBLIC_BACKEND_API_URL is not defined");
    }
    const backendRes = await fetch(`${backendUrl}/api/backauth/register`, {
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
