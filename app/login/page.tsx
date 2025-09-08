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
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone, password }),
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "登录失败");
      }
    } catch {
      setError("登录过程中出现错误");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-semibold mb-6">{SITE_NAME} · 用户登录</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        {error && <div className="text-red-600">{error}</div>}
        <div>
          <label className="block mb-1">手机号:</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border" required />
        </div>
        <div>
          <label className="block mb-1">密码:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border" required />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 mt-4">登录</button>
      </form>
    </main>
  );
}
