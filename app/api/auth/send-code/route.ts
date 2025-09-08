import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationSMS } from "@/lib/sms";

export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  if (!phone) {
    return NextResponse.json({ error: "Phone is required" }, { status: 400 });
  }
  // 若已注册，提示已存在（也可以允许用作找回密码场景，这里按注册语义）
  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return NextResponse.json({ error: "该手机号已注册" }, { status: 400 });
  }
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  sendVerificationSMS(phone, code);
  return NextResponse.json({ message: "验证码已发送" });
}
