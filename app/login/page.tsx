"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { SITE_NAME } from "@/lib/brand";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "登录失败");
      } else {
        // 根据角色跳转对应页面
        if (data.isAdmin) {
          router.push("/admin");
        } else {
          router.push("/portal");
        }
      }
    } catch {
      setError("登录过程中出现错误");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-gray-100">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center">{SITE_NAME} · 用户登录</h1>
        {error && <div className="mb-4 text-red-600 text-sm text-center">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm">手机号:</label>
            <input 
              type="tel" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              className="w-full px-3 py-2 border rounded-md" 
              placeholder="输入手机号" 
              required 
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">密码:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-3 py-2 border rounded-md" 
              placeholder="输入密码" 
              required 
            />
          </div>
          <Button type="submit" className="w-full bg-blue-600">登录</Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          还没有账号？ <Link href="/register" className="text-blue-600 hover:underline">立即注册</Link>
        </p>
      </Card>
    </main>
  );
}
