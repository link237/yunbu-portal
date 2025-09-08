import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signJWT } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { phone, password } = await req.json();
  if (!phone || !password) {
    return NextResponse.json({ error: "手机号和密码必填" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    return NextResponse.json({ error: "手机号或密码错误" }, { status: 401 });
  }
  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "手机号或密码错误" }, { status: 401 });
  }
  // 获取用户所属团队及角色
  const membership = await prisma.teamMember.findFirst({ where: { userId: user.id }, include: { team: true },});
  if (!membership) {
    return NextResponse.json({ error: "用户未加入任何团队" }, { status: 400 });
  }
  const teamId = membership.teamId;

  const isAdmin = membership.role !== "USER";
  const token = signJWT({ userId: user.id, teamId: membership.teamId, isAdmin });
  const res = NextResponse.json({ message: "登录成功", isAdmin });
  res.cookies.set({
  name: "token",
  value: token,
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  });

  res.cookies.set({
  name: "teamId",
  value: teamId,
  httpOnly: true, 
  path: "/",
  sameSite: "lax",
  });
  return res;
}
