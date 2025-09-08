"use server";

import { headers, cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

function getTeamId() {
  const h = headers(); const c = cookies();
  return h.get("x-team-id") ?? c.get("teamId")?.value ?? null;
}

export async function createApp(formData: FormData) {
  const teamId = getTeamId(); if (!teamId) throw new Error("no team");
  const name = String(formData.get("name") || "").trim();
  const url  = String(formData.get("url") || "").trim();
  const isExternal = formData.get("isExternal") === "on";

  if (!name || !url) return { ok:false, msg:"名称和URL必填" };

  const app = await prisma.app.create({ data: { name, url, isExternal } });
  await prisma.teamApp.create({
    data: { teamId, appId: app.id, defaultCanView: true, defaultCanUse: true },
  });
  return { ok:true };
}

export async function toggleShelf(appId: string, on: boolean) {
  const teamId = getTeamId(); if (!teamId) throw new Error("no team");
  // 若已有记录则更新，没有则创建
  const exists = await prisma.teamApp.findUnique({ where: { teamId_appId: { teamId, appId } } });
  if (exists) {
    await prisma.teamApp.update({
      where: { teamId_appId: { teamId, appId } },
      data: { defaultCanView: on, defaultCanUse: on },
    });
  } else {
    await prisma.teamApp.create({
      data: { teamId, appId, defaultCanView: on, defaultCanUse: on },
    });
  }
}
