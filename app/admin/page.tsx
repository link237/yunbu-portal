import Link from "next/link";
import { headers, cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const h = headers(); const c = cookies();
  const teamId = h.get("x-team-id") ?? c.get("teamId")?.value ?? null;
  if (!teamId) redirect("/login");

  const appsCount = await prisma.teamApp.count({ where: { teamId } });
  const membersCount = await prisma.teamMember.count({ where: { teamId } });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="rounded-xl border bg-white p-5">
        <div className="text-sm text-gray-500">已上架应用</div>
        <div className="mt-2 text-3xl font-semibold">{appsCount}</div>
        <Link href="/admin/apps" className="mt-4 inline-block text-violet-600 hover:underline">管理应用 →</Link>
      </div>
      <div className="rounded-xl border bg-white p-5">
        <div className="text-sm text-gray-500">团队成员</div>
        <div className="mt-2 text-3xl font-semibold">{membersCount}</div>
        <Link href="/admin/team" className="mt-4 inline-block text-violet-600 hover:underline">团队管理 →</Link>
      </div>
    </div>
  );
}
