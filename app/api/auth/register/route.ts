import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySMSCode } from "@/lib/sms";
import { signJWT, hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { phone, code, name, password } = await req.json();
  if (!phone || !code || !name || !password) {
    return NextResponse.json({ error: "缺少必要字段" }, { status: 400 });
  }
  if (!verifySMSCode(phone, code)) {
    return NextResponse.json({ error: "验证码不正确或已过期" }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return NextResponse.json({ error: "该手机号已注册" }, { status: 400 });
  }
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { phone, passwordHash, name } });
  const team = await prisma.team.create({ data: { name: `${name}的团队` } });
  await prisma.teamMember.create({ data: { userId: user.id, teamId: team.id, role: "ADMIN" } });

  // 新团队默认：将现有 App 都赋默认可见可用（可按你需求调整默认策略）
  const apps = await prisma.app.findMany();
  if (apps.length) {
    await prisma.teamApp.createMany({
      data: apps.map((a) => ({
        teamId: team.id,
        appId: a.id,
        defaultCanView: true,
        defaultCanUse: true
      }))
    });
  }

  const token = signJWT({ userId: user.id, teamId: team.id, isAdmin: true });
  const res = NextResponse.json({ message: "注册成功" });
  res.cookies.set({
    name: "token",
    value: token,
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return res;
}
