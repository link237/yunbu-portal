import { NextRequest, NextResponse } from "next/server";
import { genCode, saveSMSCode, sendVerificationSMS, SMS_CODE_TTL_MINUTES } from "@/lib/sms";

export async function POST(req: NextRequest) {
  const { phone } = await req.json().catch(() => ({}));
  if (!phone || !/^\d{11}$/.test(phone)) {
    return NextResponse.json({ ok: false, message: "手机号格式不正确" }, { status: 400 });
  }

  const code = genCode();
  await saveSMSCode(phone, code);
  await sendVerificationSMS(phone, code);

  return NextResponse.json({
    ok: true,
    ttl: SMS_CODE_TTL_MINUTES * 60, // 秒
    message: "验证码已发送",
  });
}
