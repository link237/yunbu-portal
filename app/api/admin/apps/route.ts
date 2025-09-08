import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const teamId = req.headers.get("x-team-id")!;
  const apps = await prisma.app.findMany({
    include: { teamSettings: { where: { teamId } } }
  });
  const result = apps.map((app: typeof apps[number]) => {
    const s = app.teamSettings[0];
    return {
      id: app.id,
      name: app.name,
      description: app.description,
      isExternal: app.isExternal,
      defaultCanView: s ? s.defaultCanView : false,
      defaultCanUse: s ? s.defaultCanUse : false
    };
  });
  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  const teamId = req.headers.get("x-team-id")!;
  const { appId, defaultCanView, defaultCanUse } = await req.json();
  if (!appId) return NextResponse.json({ error: "appId is required" }, { status: 400 });

  await prisma.teamApp.upsert({
    where: { teamId_appId: { teamId, appId } },
    update: { defaultCanView: !!defaultCanView, defaultCanUse: !!defaultCanUse },
    create: { teamId, appId, defaultCanView: !!defaultCanView, defaultCanUse: !!defaultCanUse }
  });
  return NextResponse.json({ message: "OK" });
}
