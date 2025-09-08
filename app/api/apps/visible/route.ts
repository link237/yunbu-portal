import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id")!;
  const teamId = req.headers.get("x-team-id")!;
  if (!userId || !teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 用户覆盖：允许的
  const userAllow = await prisma.userApp.findMany({
    where: { userId, teamId, canView: true },
    include: { app: true }
  });
  // 用户覆盖：拒绝可见的
  const userDeny = await prisma.userApp.findMany({
    where: { userId, teamId, canView: false }
  });
const denyIds = new Set(userDeny.map((u: { appId: string }) => u.appId).filter(Boolean));
  const visible: Array<{ id: string; name: string; url: string; isExternal: boolean; canUse: boolean }> = [];
  for (const u of userAllow) {
    visible.push({ id: u.app.id, name: u.app.name, url: u.app.url, isExternal: u.app.isExternal, canUse: u.canUse });
  }

  // 团队默认可见
  const teamDefault = await prisma.teamApp.findMany({
    where: { teamId, defaultCanView: true },
    include: { app: true }
  });
  for (const t of teamDefault) {
    if (denyIds.has(t.appId)) continue;
    if (visible.find(v => v.id === t.appId)) continue;
    visible.push({ id: t.app.id, name: t.app.name, url: t.app.url, isExternal: t.app.isExternal, canUse: t.defaultCanUse });
  }

  return NextResponse.json(visible);
}
