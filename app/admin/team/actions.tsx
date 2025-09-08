"use server";

import { headers, cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

function getTeamId() {
  const h = headers(); const c = cookies();
  return h.get("x-team-id") ?? c.get("teamId")?.value ?? null;
}

export async function newInvite() {
  const teamId = getTeamId(); if (!teamId) throw new Error("no team");
  const inv = await prisma.invite.create({ data: { teamId } });
  return inv.token;
}

export async function setRole(userId: string, role: "ADMIN"|"USER") {
  const teamId = getTeamId(); if (!teamId) throw new Error("no team");
  const tm = await prisma.teamMember.findUnique({ where: { userId_teamId: { userId, teamId } }, include: { team: true } });
  if (!tm) throw new Error("member not found");

  // 不允许修改首位 OWNER
  if (tm.role === "OWNER" && tm.team.ownerId === userId) {
    throw new Error("首位管理员不可修改权限");
  }
  await prisma.teamMember.update({
    where: { userId_teamId: { userId, teamId } },
    data: { role },
  });
}
