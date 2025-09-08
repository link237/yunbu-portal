import { SITE_NAME } from "./brand";

const verificationCodes = new Map<string, string>();

export function sendVerificationSMS(phone: string, code: string): void {
  verificationCodes.set(phone, code);
  console.log(`[${SITE_NAME}] SMS -> ${phone}: 验证码 ${code}（5分钟内有效）`);
}

export function verifySMSCode(phone: string, code: string): boolean {
  const storedCode = verificationCodes.get(phone);
  if (!storedCode || storedCode !== code) return false;
  verificationCodes.delete(phone);
  return true;
}
