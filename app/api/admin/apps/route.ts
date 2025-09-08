import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestContext } from "@/lib/utils";

export async function GET(req: NextRequest) {
  // 获取当前团队的所有应用列表
  const { teamId } = getRequestContext(req);
  const apps = await prisma.app.findMany({
    orderBy: { createdAt: "asc" },
    include: { teamSettings: { where: { teamId } } },
  });
  // 返回应用及团队中默认可见状态
  const appList = apps.map((app) => {
    const teamSetting = app.teamSettings[0];
    return {
      id: app.id,
      name: app.name,
      description: app.description,
      isEnabled: teamSetting ? teamSetting.defaultCanView : false,
    };
  });
  return NextResponse.json(appList);
}

export async function POST(req: NextRequest) {
  // 创建新应用，并默认在当前团队上架
  const { teamId } = getRequestContext(req);
  const { name, url, description, isExternal } = await req.json();
  if (!name || !url) {
    return NextResponse.json({ error: "应用名称和URL不能为空" }, { status: 400 });
  }
  const app = await prisma.app.create({
    data: { name, url, description, isExternal: !!isExternal },
  });
  // 将新应用加入当前团队，默认可见可用
  await prisma.teamApp.create({
    data: { teamId, appId: app.id, defaultCanView: true, defaultCanUse: true },
  });
  return NextResponse.json({ message: "应用已创建", appId: app.id }, { status: 201 });
}
