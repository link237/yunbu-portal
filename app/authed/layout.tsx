// app/(authed)/layout.tsx
import { SITE_NAME } from "@/lib/brand";
import Link from "next/link";

export default function AuthedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* 侧边栏 */}
      <aside className="w-60 bg-white bg-opacity-90 backdrop-blur-sm border-r border-gray-200 flex flex-col">
        <div className="py-4 px-6 text-2xl font-bold">{SITE_NAME}</div>
        {/* 导航菜单 */}
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/dashboard" className="block py-2 px-3 rounded hover:bg-purple-100">
            可用应用
          </Link>
          <Link href="/admin/apps" className="block py-2 px-3 rounded hover:bg-purple-100">
            应用管理
          </Link>
          <Link href="/admin/users" className="block py-2 px-3 rounded hover:bg-purple-100">
            用户管理
          </Link>
          <Link href="/admin/team" className="block py-2 px-3 rounded hover:bg-purple-100">
            团队管理
          </Link>
        </nav>
      </aside>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部操作栏 */}
        <header className="w-full bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-between 
                           border-b border-gray-200 px-6 py-3">
          <h1 className="text-lg font-semibold">管理后台</h1>
          {/* 用户操作：显示当前用户与退出按钮 */}
          <div>
            <span className="mr-4 text-gray-600">超级管理员</span>
            <Link href="/api/auth/logout" className="text-blue-600 hover:underline">退出登录</Link>
          </div>
        </header>

        {/* 内容显示区域：内部再加适当内边距 */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
