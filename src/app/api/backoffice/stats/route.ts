import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${BACKEND_URL}/api/admin/stats`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${(session as any)?.backendToken}`,
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
