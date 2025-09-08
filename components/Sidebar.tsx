"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, Users, UserPlus, BarChart } from "lucide-react";

/** 侧边栏导航组件 */
const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const navItems = [
    { name: "控制台", href: "/admin", icon: Home },
    { name: "应用管理", href: "/admin/apps", icon: Grid },
    { name: "用户管理", href: "/admin/users", icon: Users },
    { name: "团队管理", href: "/admin/team", icon: UserPlus },
    { name: "数据分析", href: "/admin/analytics", icon: BarChart },
  ];

  return (
    <aside className="h-full w-60 bg-white border-r flex flex-col">
      <div className="p-4 font-bold text-xl border-b">云步信息</div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const ActiveIcon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive ? "bg-gray-200 text-gray-900" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <ActiveIcon className="w-5 h-5 mr-2" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
