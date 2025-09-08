"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

export default function AdminUsersPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    };
    fetchMembers();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">团队成员</h1>
      {members.length === 0 ? (
        <p>当前团队暂无其他成员。</p>
      ) : (
        <ul>
          {members.map(member => (
            <li key={member.id} className="mb-2">
              {member.name} ({member.role === "ADMIN" ? "管理员" : "成员"}) -{" "}
              <Link href={`/admin/users/${member.id}/apps`} className="text-blue-600 underline">
                管理权限
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-sm text-gray-600">提示：示例未实现邀请/添加团队成员。</p>
    </main>
  );
}
