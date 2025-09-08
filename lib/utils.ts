import { NextRequest } from "next/server";
import { randomBytes } from "node:crypto";

// 生成团队邀请令牌（随机短字符串）
export function generateInviteToken(): string {
  return randomBytes(4).toString("hex");
}

// 从 NextRequest 提取用户上下文（需确保 middleware 已设置请求头）
export function getRequestContext(req: NextRequest) {
  const userId = req.headers.get("x-user-id") || "";
  const teamId = req.headers.get("x-team-id") || "";
  const isAdmin = req.headers.get("x-is-admin") === "true";
  return { userId, teamId, isAdmin };
}
