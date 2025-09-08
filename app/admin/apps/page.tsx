import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createApp } from './actions';

export default async function AppsPage() {
  const h = headers();
  const teamId = h.get('x-team-id');
  if (!teamId) redirect('/login');

  // 取团队内已上架应用（联表 TeamApp）
  const teamApps = await prisma.teamApp.findMany({
    where: { teamId },
    include: { app: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-6 space-y-8">
      <section className="max-w-xl">
        <h2 className="font-semibold mb-3">新建应用</h2>

        {/* 关键点：使用 <form action={createApp}>，并保证输入框的 name 与 actions.ts 中读取的一致 */}
        <form action={createApp} className="space-y-3">
          <div className="flex gap-3">
            <input
              name="name"
              placeholder="应用名称"
              className="border rounded px-3 py-2 flex-1"
              required
            />
            <input
              name="url"
              placeholder="https://www.coze.cn/..."
              className="border rounded px-3 py-2 flex-[2]"
              required
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="isExternal" />
            外部链接
          </label>

          <button type="submit" className="px-4 py-2 rounded bg-purple-600 text-white">
            创建并上架
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-semibold mb-3">应用列表</h2>
        {teamApps.length === 0 ? (
          <div className="text-sm text-gray-500">还没有应用</div>
        ) : (
          <ul className="space-y-2">
            {teamApps.map((ta) => (
              <li key={`${ta.teamId}-${ta.appId}`} className="border rounded p-3">
                <div className="font-medium">{ta.app.name}</div>
                <div className="text-xs text-gray-500">{ta.app.url}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
