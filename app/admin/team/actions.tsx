"use server";

import { headers, cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

function getTeamId() {
  const h = headers();
  const c = cookies();
  return h.get("x-team-id") ?? c.get("teamId")?.value ?? null;
}

export async function newInvite() {
  const teamId = getTeamId();
  if (!teamId) throw new Error("no team");

  // 生成一个 token（如果你的 Prisma 有默认 token，也可以不传）
  const token = randomUUID();

  // 使用 upsert 确保不存在重复的邀请
  const inv = await prisma.invite.upsert({
    where: { teamId },  // 需要在 schema 里让 teamId 唯一
    update: { token, createdAt: new Date() },
    create: { teamId, token },
  });

  // 关键：刷新页面数据
  revalidatePath("/admin/team");

  // 返回给前端，用来 toast / 展示
  return { ok: true, token: inv.token };
}

export async function setRole(userId: string, role: "ADMIN" | "USER") {
  const teamId = getTeamId();
  if (!teamId) throw new Error("no team");

  const tm = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId, teamId } },
    include: { team: true },
  });
  if (!tm) throw new Error("member not found");

  // 不允许修改首位 OWNER
  if (tm.role === "OWNER" && tm.team.ownerId === userId) {
    throw new Error("首位管理员不可修改权限");
  }

  await prisma.teamMember.update({
    where: { userId_teamId: { userId, teamId } },
    data: { role },
  });

  // 修改成功后刷新页面
  revalidatePath("/admin/team");
  return { ok: true };
}
