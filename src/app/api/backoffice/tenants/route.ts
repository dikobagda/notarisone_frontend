import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

async function getAdminHeaders(session: any) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${(session as any)?.backendToken}`,
  };
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${BACKEND_URL}/api/admin/tenants`, {
    headers: await getAdminHeaders(session),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const res = await fetch(`${BACKEND_URL}/api/admin/tenants/onboard`, {
    method: "POST",
    headers: await getAdminHeaders(session),
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
