import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signJWT } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { phone, password } = await req.json();
  if (!phone || !password) {
    return NextResponse.json({ error: "手机号和密码必填" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) return NextResponse.json({ error: "手机号或密码错误" }, { status: 401 });

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "手机号或密码错误" }, { status: 401 });

  const membership = await prisma.teamMember.findFirst({ where: { userId: user.id } });
  if (!membership) return NextResponse.json({ error: "用户未加入任何团队" }, { status: 400 });

  const token = signJWT({ userId: user.id, teamId: membership.teamId, isAdmin: membership.role === "ADMIN" });
  const res = NextResponse.json({ message: "登录成功" });
  res.cookies.set({
    name: "token",
    value: token,
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return res;
}
