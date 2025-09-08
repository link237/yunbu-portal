import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestContext } from "@/lib/utils";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  // 更新应用在当前团队的上架状态（defaultCanView/defaultCanUse）
  const { teamId } = getRequestContext(req);
  const appId = params.id;
  const { enabled } = await req.json();
  const teamApp = await prisma.teamApp.findUnique({
    where: { teamId_appId: { teamId, appId } },
  });
  if (enabled) {
    if (teamApp) {
      await prisma.teamApp.update({
        where: { teamId_appId: { teamId, appId } },
        data: { defaultCanView: true, defaultCanUse: true },
      });
    } else {
      await prisma.teamApp.create({
        data: { teamId, appId, defaultCanView: true, defaultCanUse: true },
      });
    }
  } else {
    if (teamApp) {
      await prisma.teamApp.update({
        where: { teamId_appId: { teamId, appId } },
        data: { defaultCanView: false, defaultCanUse: false },
      });
    }
    // 如果 teamApp 不存在且请求关闭，无需操作（默认即关闭）
  }
  return NextResponse.json({ message: "应用状态已更新" });
}
