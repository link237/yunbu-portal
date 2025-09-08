import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestContext, generateInviteToken } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const { teamId } = getRequestContext(req);
  // 生成新邀请码并保存
  const token = generateInviteToken();
  await prisma.invite.create({
    data: { token, teamId },
  });
  // 构造完整注册链接
  const { origin } = req.nextUrl;
  const inviteLink = `${origin}/register?invite=${token}`;
  return NextResponse.json({ inviteLink });
}
