import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "缺少邀请码参数" }, { status: 400 });
  }
  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite) {
    return NextResponse.json({ error: "邀请码无效" }, { status: 400 });
  }
  const team = await prisma.team.findUnique({ where: { id: invite.teamId } });
  return NextResponse.json({ teamName: team?.name });
}
