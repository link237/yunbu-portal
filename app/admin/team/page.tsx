import { headers, cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { newInvite, setRole } from "./actions";

export default async function TeamPage() {
  const h = headers(); const c = cookies();
  const teamId = h.get("x-team-id") ?? c.get("teamId")?.value ?? null;
  if (!teamId) redirect("/login");

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  const members = await prisma.teamMember.findMany({
    where: { teamId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-5">
        <div className="font-semibold mb-2">邀请成员</div>
        <form action={async () => { "use server"; const token = await newInvite(); }}
              className="flex items-center gap-3">
          <button className="rounded bg-violet-600 px-4 py-2 text-white hover:bg-violet-700">
            生成注册链接
          </button>
          <p className="text-sm text-gray-500">生成后在控制台打印，或按你需要改为复制到剪贴板。</p>
        </form>
        <p className="mt-2 text-xs text-gray-500">
          规则：通过该链接注册的用户默认归属团队 <b>{team?.name}</b>，初始角色为普通用户（USER）。
        </p>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <div className="font-semibold mb-4">成员列表</div>
        <div className="grid gap-2">
          {members.map(m => {
            const canChange = !(m.role === "OWNER" && m.userId === team?.ownerId);
            return (
              <div key={m.id} className="flex items-center justify-between rounded border px-4 py-3">
                <div>
                  <div className="font-medium">{m.user.username} <span className="text-xs text-gray-500">({m.user.email})</span></div>
                  <div className="text-xs text-gray-500">角色：{m.role}</div>
                </div>
                <div className="flex items-center gap-2">
                  <form action={async () => { "use server"; await setRole(m.userId, "ADMIN"); }}>
                    <button disabled={!canChange} className="rounded px-3 py-1 text-sm bg-gray-200 disabled:opacity-50">设为管理员</button>
                  </form>
                  <form action={async () => { "use server"; await setRole(m.userId, "USER"); }}>
                    <button disabled={!canChange} className="rounded px-3 py-1 text-sm bg-gray-200 disabled:opacity-50">设为普通用户</button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
