// app/(authed)/admin/team/page.tsx
"use client";
import { useState, useEffect } from "react";

interface TeamMemberInfo {
  id: string;
  name: string;
  role: "ADMIN" | "USER";
}

export default function TeamManagementPage() {
  const [members, setMembers] = useState<TeamMemberInfo[]>([]);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string>("");

  useEffect(() => {
    // 获取团队成员列表（类似用户管理，但精简信息）
    fetch("/api/admin/team")
      .then(res => res.json())
      .then(data => {
        setTeamName(data.teamName);
        setMembers(data.members);
      });
  }, []);

  const generateInvite = async () => {
    // 调用生成邀请链接的API
    const res = await fetch("/api/admin/invite", { method: "POST" });
    const data = await res.json();
    if (res.ok && data.inviteCode) {
      // 假设返回 inviteCode 或完整URL
      setInviteLink(`${window.location.origin}/register/${data.inviteCode}`);
    }
  };

  const promoteMember = async (userId: string, makeAdmin: boolean) => {
    await fetch(`/api/admin/team/promote`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: makeAdmin ? "ADMIN" : "USER" })
    });
    setMembers(members.map(m => 
      m.id === userId ? { ...m, role: makeAdmin ? "ADMIN" : "USER" } : m
    ));
  };

  const removeMember = async (userId: string) => {
    await fetch(`/api/admin/team/remove`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
    setMembers(members.filter(m => m.id !== userId));
  };

  // 假定我们能识别原始超级管理员，例如列表第一个 ADMIN 为创建者
  const originalAdminId = members.find(m => m.role === "ADMIN")?.id || null;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">团队管理</h2>
      <p className="mb-6">团队名称：<span className="font-medium">{teamName}</span></p>

      {/* 新增成员邀请 */}
      <div className="mb-6">
        {inviteLink ? (
          <div className="bg-purple-50 border border-purple-200 text-purple-800 p-4 rounded">
            <p>邀请链接已生成：</p>
            <p className="break-all"><strong>{inviteLink}</strong></p>
            <p className="text-sm text-gray-600 mt-1">将此链接发送给新成员进行注册。</p>
          </div>
        ) : (
          <button onClick={generateInvite}
                  className="px-4 py-2 bg-blue-600 text-white rounded">
            新增成员
          </button>
        )}
      </div>

      {/* 成员列表 */}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="py-2 px-3">成员</th>
            <th className="py-2 px-3">角色</th>
            <th className="py-2 px-3">操作</th>
          </tr>
        </thead>
        <tbody>
          {members.map(member => (
            <tr key={member.id} className="border-b last:border-0">
              <td className="py-2 px-3">{member.name}</td>
              <td className="py-2 px-3">
                {member.role === "ADMIN" ? "管理员" : "普通用户"}
              </td>
              <td className="py-2 px-3 space-x-2">
                {member.role === "USER" ? (
                  // 普通用户：提供提升为管理员按钮
                  <button onClick={() => promoteMember(member.id, true)}
                          className="text-blue-600 hover:underline">
                    提升为管理员
                  </button>
                ) : (
                  // 管理员：提供降级为普通用户按钮（原始超级管理员除外）
                  <>
                    {member.id !== originalAdminId && (
                      <button onClick={() => promoteMember(member.id, false)}
                              className="text-blue-600 hover:underline">
                        取消管理员
                      </button>
                    )}
                  </>
                )}
                {/* 移除成员按钮（原始超级管理员除外） */}
                {member.id !== originalAdminId && (
                  <button onClick={() => removeMember(member.id)}
                          className="text-red-600 hover:underline">
                    移除
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
