// server component
import { headers, cookies } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const h = headers(); const c = cookies();
  const teamId = h.get("x-team-id") ?? c.get("teamId")?.value ?? null;
  if (!teamId) redirect("/login");
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) redirect("/login");

  return (
    <div className="min-h-screen flex bg-[#fafafa]">
      {/* sidebar */}
      <aside className="w-64 border-r bg-white">
        <div className="p-4 font-semibold">云步信息 • 管理后台</div>
        <nav className="space-y-1 px-2">
          <Link href="/admin" className="block rounded px-3 py-2 hover:bg-gray-100">仪表盘</Link>
          <Link href="/admin/apps" className="block rounded px-3 py-2 hover:bg-gray-100">应用管理</Link>
          <Link href="/admin/team" className="block rounded px-3 py-2 hover:bg-gray-100">团队管理</Link>
        </nav>
      </aside>

      {/* main */}
      <div className="flex-1">
        <header className="h-14 flex items-center justify-between border-b bg-white px-6">
          <div className="text-sm text-gray-500">团队：<span className="font-medium text-gray-800">{team.name}</span></div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
