import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import Card from "@/components/Card";

/** 用户门户首页 */
export default async function PortalHomePage() {
  const headersList = headers();
  const teamId = headersList.get("x-team-id")!;
  // 查询当前团队已上架的应用列表
  const teamApps = await prisma.teamApp.findMany({
    where: { teamId, defaultCanView: true },
    include: { app: true },
    orderBy: { app: { name: "asc" } },
  });

  return (
    <Card>
      <h1 className="text-2xl font-semibold mb-4">我的应用</h1>
      {teamApps.length === 0 ? (
        <p className="text-gray-600">暂无可用应用。</p>
      ) : (
        <ul className="space-y-2">
          {teamApps.map(({ app }) => (
            <li key={app.id}>
              <a 
                href={app.url} 
                target={app.isExternal ? "_blank" : "_self"} 
                className="text-blue-600 hover:underline"
              >
                {app.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
