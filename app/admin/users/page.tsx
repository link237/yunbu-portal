import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import Card from "@/components/Card";

/** 用户管理页：列出团队成员及权限管理 */
export default async function AdminUsersPage() {
  const headersList = headers();
  const teamId = headersList.get("x-team-id")!;
  // 获取团队所有成员及用户信息
  const members = await prisma.teamMember.findMany({
    where: { teamId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
  // 为前端传递精简数据
  const initialMembers = members.map(m => ({
    userId: m.userId,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
  }));

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">用户管理</h2>
      {/* 前端表格组件 */}
      {/* @ts-expect-error Server Component */}
      <UserTable initialMembers={initialMembers} />
    </Card>
  );
}

/** 前端用户表格组件，支持角色变更操作 */
function UserTable({ initialMembers }: { initialMembers: Array<{ userId: string; name: string; email: string; role: string }> }) {
  "use client";
  import { useState } from "react";
  const [members, setMembers] = useState(initialMembers);

  const changeRole = async (userId: string, newRole: string) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      setMembers(prev => prev.map(m => m.userId === userId ? { ...m, role: newRole } : m));
    } else {
      const data = await res.json();
      alert(data.error || "操作失败");
    }
  };

  return (
    <table className="w-full text-sm">
      <thead className="text-left bg-gray-50">
        <tr>
          <th className="p-2">用户名</th>
          <th className="p-2">邮箱</th>
          <th className="p-2">角色</th>
          <th className="p-2">操作</th>
        </tr>
      </thead>
      <tbody>
        {members.map(member => (
          <tr key={member.userId} className="border-b last:border-none">
            <td className="p-2">{member.name}</td>
            <td className="p-2">{member.email}</td>
            <td className="p-2">
              {member.role === "OWNER"
                ? "超级管理员"
                : member.role === "ADMIN"
                ? "管理员"
                : "普通用户"}
            </td>
            <td className="p-2 space-x-2">
              {member.role === "USER" && (
                <button 
                  onClick={() => changeRole(member.userId, "ADMIN")} 
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded-md"
                >
                  设为管理员
                </button>
              )}
              {member.role === "ADMIN" && (
                <button 
                  onClick={() => changeRole(member.userId, "USER")} 
                  className="px-2 py-1 text-xs bg-gray-400 text-white rounded-md"
                >
                  取消管理员
                </button>
              )}
              {member.role === "OWNER" && <span className="text-xs text-gray-500">不可更改</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
