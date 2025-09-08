import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  const teamId = req.headers.get("x-team-id")!;
  const targetUserId = params.userId;

  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: targetUserId, teamId } },
    include: { user: true }
  });
  if (!membership) return NextResponse.json({ error: "User not in team" }, { status: 404 });

  const apps = await prisma.app.findMany({
    include: {
      teamSettings: { where: { teamId } },
      userSettings: { where: { userId: targetUserId, teamId } }
    }
  });

  const result = apps.map(app => {
    const t = app.teamSettings[0];
    const u = app.userSettings[0];
    const defaultCanView = t ? t.defaultCanView : false;
    const defaultCanUse = t ? t.defaultCanUse : false;
    const overrideCanView = u ? u.canView : null;
    const overrideCanUse = u ? u.canUse : null;
    const effectiveCanView = u ? u.canView : defaultCanView;
    const effectiveCanUse = u ? u.canUse : defaultCanUse;
    return {
      appId: app.id,
      name: app.name,
      defaultCanView,
      defaultCanUse,
      overrideCanView,
      overrideCanUse,
      effectiveCanView,
      effectiveCanUse
    };
  });

  return NextResponse.json({ user: { id: membership.user.id, name: membership.user.name }, apps: result });
}

export async function PUT(req: NextRequest, { params }: { params: { userId: string } }) {
  const teamId = req.headers.get("x-team-id")!;
  const targetUserId = params.userId;
  const { appId, canView, canUse } = await req.json();

  if (!appId || typeof canView !== "boolean" || typeof canUse !== "boolean") {
    return NextResponse.json({ error: "appId, canView, canUse required" }, { status: 400 });
  }

  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: targetUserId, teamId } }
  });
  if (!membership) return NextResponse.json({ error: "User not in team" }, { status: 404 });

  await prisma.userApp.upsert({
    where: { userId_teamId_appId: { userId: targetUserId, teamId, appId } },
    update: { canView: !!canView, canUse: !!canUse },
    create: { userId: targetUserId, teamId, appId, canView: !!canView, canUse: !!canUse }
  });

  return NextResponse.json({ message: "OK" });
}
