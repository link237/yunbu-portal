// app/(authed)/admin/users/page.tsx
"use client";
import { useEffect, useState } from "react";

interface UserInfo {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: "ADMIN" | "USER";
  active: boolean;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserInfo[]>([]);

  useEffect(() => {
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  const toggleActive = async (userId: string, newActive: boolean) => {
    await fetch(`/api/admin/users/${userId}/active`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: newActive })
    });
    setUsers(users.map(u => u.id === userId ? { ...u, active: newActive } : u));
  };

  const manageApps = (userId: string) => {
    // 可以导航到具体用户权限编辑页面，或弹出模态框
    // 例如：router.push(`/admin/users/${userId}`) 到一个权限编辑子页面
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">用户管理</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="py-2 px-3">用户名</th>
            <th className="py-2 px-3">手机号</th>
            <th className="py-2 px-3">角色</th>
            <th className="py-2 px-3">状态</th>
            <th className="py-2 px-3">操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b last:border-0">
              <td className="py-2 px-3">{u.name}</td>
              <td className="py-2 px-3">{u.phone || "-"}</td>
              <td className="py-2 px-3">
                {u.role === "ADMIN" ? "管理员" : "普通用户"}
              </td>
              <td className="py-2 px-3">
                {u.active ? "正常" : "禁用"}
              </td>
              <td className="py-2 px-3 space-x-2">
                {/* 禁用/启用 按钮 */}
                <button onClick={() => toggleActive(u.id, !u.active)}
                        className="text-sm text-blue-600 hover:underline">
                  {u.active ? "禁用" : "启用"}
                </button>
                {/* 权限编辑 按钮 */}
                <button onClick={() => manageApps(u.id)}
                        className="text-sm text-blue-600 hover:underline">
                  编辑权限
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
