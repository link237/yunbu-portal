import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import Topbar from "@/components/Topbar";

/** 普通用户门户布局（仅顶部导航） */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  // 获取团队名称，供 Topbar 显示
  const headersList = headers();
  const teamId = headersList.get("x-team-id")!;
  const team = await prisma.team.findUnique({ where: { id: teamId } });

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar teamName={team?.name} />
      <main className="flex-1 p-6 bg-gray-100">{children}</main>
    </div>
  );
}
