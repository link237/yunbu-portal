// app/(auth)/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SITE_NAME } from "@/lib/brand";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password })
    });
    const data = await res.json();
    if (res.ok) {
      // 判断角色跳转
      if (data.isAdmin) router.push("/admin/apps");
      else router.push("/dashboard");
    } else {
      setError(data.error || "登录失败");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {SITE_NAME} 用户登录
        </h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">手机号</label>
            <input type="tel" value={phone}
                   onChange={e => setPhone(e.target.value)}
                   className="w-full px-3 py-2 border rounded" required />
          </div>
          <div className="mb-6">
            <label className="block mb-1">密码</label>
            <input type="password" value={password}
                   onChange={e => setPassword(e.target.value)}
                   className="w-full px-3 py-2 border rounded" required />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
            登录
          </button>
        </form>
      </div>
    </main>
  );
}
