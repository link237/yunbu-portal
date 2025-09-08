import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { signJWT } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { verifySMSCode, consumeSMSCode } from "@/lib/sms";
import { TeamRole } from "@prisma/client"; // <- 使用枚举

export async function POST(req: NextRequest) {
  const {
    username,
    email,
    companyName,
    title,
    phone,
    code,
    password,
  } = await req.json().catch(() => ({}));

  // 基本校验
  if (!username || !email || !companyName || !title || !phone || !code || !password) {
    return NextResponse.json({ ok: false, message: "请完整填写信息" }, { status: 400 });
  }
  if (!/^\d{11}$/.test(phone)) {
    return NextResponse.json({ ok: false, message: "手机号格式不正确" }, { status: 400 });
  }

  // 验证短信
  const ok = await verifySMSCode(phone, code);
  if (!ok) {
    return NextResponse.json({ ok: false, message: "验证码无效或已过期" }, { status: 400 });
  }

  // 查重：手机号/邮箱/用户名
  const exists = await prisma.user.findFirst({
    where: { OR: [{ phone }, { email }, { username }] },
  });
  if (exists) {
    return NextResponse.json({ ok: false, message: "该用户已存在（手机号/邮箱/用户名重复）" }, { status: 409 });
  }

  // 事务：创建用户、团队、成员关系
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { username, email, phone, passwordHash, title, companyName },
    });

    const team = await tx.team.create({
      data: { name: companyName, ownerId: user.id },
    });

    await tx.teamMember.create({
      data: { teamId: team.id, userId: user.id, role: TeamRole.OWNER }, // <- 枚举
    });

    return { user, team };
  });

  // 消费验证码
  await consumeSMSCode(phone);

  // 签发 token（用你的 signJWT）
  const token = await signJWT({
    userId: result.user.id,
    teamId: result.team.id,
    isAdmin: true, // 初始注册者为 OWNER/管理员
  });

  // 返回并写 cookie
  const res = NextResponse.json({ ok: true, message: "注册成功" });
  res.cookies.set({
    name: "token",
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  res.cookies.set({
    name: "teamId",
    value: result.team.id, // <- 关键：用 result.team.id
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return res;
}
