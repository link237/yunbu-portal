"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SITE_NAME } from "@/lib/brand";

export default function RegisterPage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [error, setError] = useState("");
  const router = useRouter();

  const sendCode = async () => {
    setError("");
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "发送验证码失败");
      } else {
        alert("验证码已发送（开发环境见服务端控制台日志）");
        setStep("verify");
      }
    } catch {
      setError("发送验证码时出现错误");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone, code, name, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "注册失败");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("注册过程中出现错误");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-semibold mb-6">{SITE_NAME} · 用户注册</h1>
      {step === "phone" && (
        <div className="w-full max-w-sm space-y-4">
          {error && <div className="text-red-600">{error}</div>}
          <div>
            <label className="block mb-1">手机号:</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border" required />
          </div>
          <button onClick={sendCode} className="w-full bg-blue-600 text-white py-2">发送验证码</button>
        </div>
      )}
      {step === "verify" && (
        <form onSubmit={handleRegister} className="w-full max-w-sm space-y-4">
          {error && <div className="text-red-600">{error}</div>}
          <div>
            <label className="block mb-1">验证码:</label>
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-3 py-2 border" required />
          </div>
          <div>
            <label className="block mb-1">姓名:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border" required />
          </div>
          <div>
            <label className="block mb-1">密码:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border" required />
          </div>
          <button type="submit" className="w-full bg-green-600 text-white py-2">注册</button>
        </form>
      )}
    </main>
  );
}
