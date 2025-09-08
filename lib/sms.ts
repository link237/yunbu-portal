// lib/sms.ts
import { prisma } from "@/lib/prisma";

export const SMS_CODE_TTL_MINUTES = 15; // ✅ 统一控制：15分钟

// 生成6位验证码
export function genCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 保存验证码（同手机号多次发送会覆盖旧的，始终以最新一条为准）
 */
export async function saveSMSCode(phone: string, code: string) {
  const expiresAt = new Date(Date.now() + SMS_CODE_TTL_MINUTES * 60 * 1000);
  await prisma.smsCode.upsert({
    where: { phone },
    update: { code, expiresAt, used: false },
    create: { phone, code, expiresAt, used: false },
  });
}

/**
 * 校验验证码（未过期且未使用）
 */
export async function verifySMSCode(phone: string, code: string) {
  const rec = await prisma.smsCode.findUnique({ where: { phone } });
  if (!rec) return false;
  if (rec.used) return false;
  if (rec.code !== code) return false;
  if (rec.expiresAt.getTime() < Date.now()) return false;
  return true;
}

/** 标记已使用 */
export async function consumeSMSCode(phone: string) {
  await prisma.smsCode.update({
    where: { phone },
    data: { used: true },
  });
}

/** 你真实的发送短信逻辑（此处示例直接打印/或调用短信网关） */
export async function sendVerificationSMS(phone: string, code: string) {
  // TODO: 换成你的短信服务商调用
  console.log(`[MOCK-SMS] send to ${phone}: code=${code}`);
}
