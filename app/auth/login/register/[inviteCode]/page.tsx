// app/(auth)/register/[inviteCode]/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SITE_NAME } from "@/lib/brand";

export default function InviteRegisterPage({ params }: { params: { inviteCode: string } }) {
  const router = useRouter();
  const [teamName, setTeamName] = useState<string | null>(null);
  const [step, setStep] = useState<"phone" | "info">("phone");
  // ... 定义 phone, code, username, password, etc.（无需 company/email，因为来自邀请）
  const inviteCode = params.inviteCode;

  useEffect(() => {
    // 根据 inviteCode 获取团队信息
    fetch(`/api/invite/${inviteCode}`)
      .then(res => res.json())
      .then(data => {
        if (data.teamName) setTeamName(data.teamName);
        else setTeamName(""); // 标记无效
      });
  }, [inviteCode]);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => { /* 类似前述 handleRegister，但是不包含公司/邮箱 */ };

  if (teamName === null) {
    return <p className="text-center p-6">加载中...</p>;
  }
  if (teamName === "") {
    return <p className="text-center p-6 text-red-600">邀请链接无效或已过期</p>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          加入团队「{teamName}」
        </h1>
        {/* 类似前面的 form，与超级管理员注册区别：无公司/邮箱字段 */}
        {/* step === 'phone' 时输入手机号 -> 发送验证码， step === 'info' 时输入验证码、用户名、密码 */}
      </div>
    </main>
  );
}
