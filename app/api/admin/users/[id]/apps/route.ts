import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestContext } from "@/lib/utils";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { teamId } = getRequestContext(req);
  const targetUserId = params.id;
  const { role } = await req.json();
  // 不允许将角色设置为空或非法值
  if (!role || !["USER", "ADMIN"].includes(role)) {
    return NextResponse.json({ error: "无效的角色设定" }, { status: 400 });
  }
  // 查找目标成员记录
  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: targetUserId, teamId } },
  });
  if (!membership) {
    return NextResponse.json({ error: "用户不在当前团队" }, { status: 404 });
  }
  // 超级管理员角色不可被修改
  if (membership.role === "OWNER") {
    return NextResponse.json({ error: "无法变更团队创始人的权限" }, { status: 403 });
  }
  // 执行角色更新
  await prisma.teamMember.update({
    where: { userId_teamId: { userId: targetUserId, teamId } },
    data: { role: role },
  });
  return NextResponse.json({ message: "用户角色已更新" });
}
