import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const res = await fetch(`${BACKEND_URL}/api/admin/tenants/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${(session as any)?.backendToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const res = await fetch(`${BACKEND_URL}/api/admin/tenants/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${(session as any)?.backendToken}`,
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
