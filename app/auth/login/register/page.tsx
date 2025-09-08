// app/(auth)/register/page.tsx （超级管理员注册）
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SITE_NAME } from "@/lib/brand";

export default function RegisterPage() {
  const [step, setStep] = useState<"phone" | "info">("phone");
  const [phone, setPhone] = useState("");      // 手机号
  const [code, setCode] = useState("");        // 短信验证码
  const [email, setEmail] = useState("");      // 邮箱
  const [company, setCompany] = useState("");  // 公司名称
  const [position, setPosition] = useState(""); // 职级
  const [username, setUsername] = useState(""); // 用户名
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const sendCode = async () => {
    setError("");
    // 调用发送验证码API
    const res = await fetch("/api/auth/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone })
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "验证码发送失败");
    } else {
      alert("验证码已发送！");
      setStep("info");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // 提交注册请求，包含所有字段
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ phone, code, email, company, position, username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "注册失败");
    } else {
      // 注册成功，跳转
      router.push("/dashboard");  // 超级管理员登录后将重定向到后台管理主页，在后续处理中再跳转到 /admin
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      {/* 注册卡片容器 */}
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {SITE_NAME} 用户注册
        </h1>

        {step === "phone" ? (
          <div>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <div className="mb-4">
              <label className="block mb-1">手机号</label>
              <input type="tel" value={phone} 
                     onChange={e => setPhone(e.target.value)}
                     className="w-full px-3 py-2 border rounded" required />
            </div>
            <button type="button" onClick={sendCode}
                    className="w-full bg-blue-600 text-white py-2 rounded">
              发送验证码
            </button>
          </div>
        ) : (
          <form onSubmit={handleRegister}>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <div className="mb-3">
              <label className="block mb-1">验证码</label>
              <input type="text" value={code}
                     onChange={e => setCode(e.target.value)}
                     className="w-full px-3 py-2 border rounded" required />
            </div>
            <div className="mb-3">
              <label className="block mb-1">邮箱</label>
              <input type="email" value={email}
                     onChange={e => setEmail(e.target.value)}
                     className="w-full px-3 py-2 border rounded" required />
            </div>
            <div className="mb-3">
              <label className="block mb-1">公司名称</label>
              <input type="text" value={company}
                     onChange={e => setCompany(e.target.value)}
                     className="w-full px-3 py-2 border rounded" required />
            </div>
            <div className="mb-3">
              <label className="block mb-1">职级</label>
              <input type="text" value={position}
                     onChange={e => setPosition(e.target.value)}
                     className="w-full px-3 py-2 border rounded" placeholder="例如：CTO, 产品经理" />
            </div>
            <div className="mb-3">
              <label className="block mb-1">用户名</label>
              <input type="text" value={username}
                     onChange={e => setUsername(e.target.value)}
                     className="w-full px-3 py-2 border rounded" required />
            </div>
            <div className="mb-4">
              <label className="block mb-1">密码</label>
              <input type="password" value={password}
                     onChange={e => setPassword(e.target.value)}
                     className="w-full px-3 py-2 border rounded" required />
            </div>
            <button type="submit"
                    className="w-full bg-green-600 text-white py-2 rounded">
              注册并进入后台
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
