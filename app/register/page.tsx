"use client";

import React, { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    companyName: "",
    title: "",
    phone: "",
    code: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [sending, setSending] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const onChange = (k: string, v: string | boolean) =>
    setForm((s) => ({ ...s, [k]: v }));

  // 发送验证码（不离开页面）
  const sendCode = async () => {
    if (!/^\d{11}$/.test(form.phone)) {
      setMsg("请填写正确的手机号");
      return;
    }
    try {
      setSending(true);
      setMsg(null);
      const r = await fetch("/api/auth/send-code", {
        method: "POST",
        body: JSON.stringify({ phone: form.phone }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) {
        setMsg(data.message || "发送失败");
      } else {
        setMsg(`验证码已发送（${Math.floor(data.ttl / 60)} 分钟内有效）`);
        // 60s 倒计时（仅限制按钮频率，与15分钟有效期无关）
        setSeconds(60);
        const timer = setInterval(() => {
          setSeconds((s) => {
            if (s <= 1) {
              clearInterval(timer);
              return 0;
            }
            return s - 1;
          });
        }, 1000);
      }
    } catch (e) {
      setMsg("发送失败");
    } finally {
      setSending(false);
    }
  };

  // 提交注册
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!form.agree) {
      setMsg("请先勾选同意协议");
      return;
    }
    if (form.password.length < 8) {
      setMsg("密码至少 8 位");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setMsg("两次输入的密码不一致");
      return;
    }
    try {
      setSubmitting(true);
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          companyName: form.companyName.trim(),
          title: form.title.trim(),
          phone: form.phone.trim(),
          code: form.code.trim(),
          password: form.password,
        }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) {
        setMsg(data.message || "注册失败");
      } else {
        // 成功后跳后台或首页
        window.location.href = "/admin";
      }
    } catch (e) {
      setMsg("注册失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-b from-[#f1e6ff] to-[#faf6ff] py-12">
      <form
        onSubmit={submit}
        className="w-[640px] bg-white/70 backdrop-blur rounded-2xl shadow-lg p-8 mt-4"
      >
        <div className="mb-6">
          <div className="text-lg font-semibold text-[#6b21a8]">云步信息</div>
          <div className="text-xs text-gray-500 mt-1">创建你的专属实例</div>
        </div>

        {msg && (
          <div className="mb-4 rounded-md bg-purple-50 border border-purple-200 px-3 py-2 text-sm text-purple-700">
            {msg}
          </div>
        )}

        <div className="space-y-4">
          <input
            className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-300"
            placeholder="用户名（3~20位，字母/数字/下划线）"
            value={form.username}
            onChange={(e) => onChange("username", e.target.value)}
          />

          <input
            className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-300"
            placeholder="邮箱"
            type="email"
            value={form.email}
            onChange={(e) => onChange("email", e.target.value)}
          />

          <input
            className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-300"
            placeholder="公司名称"
            value={form.companyName}
            onChange={(e) => onChange("companyName", e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-300"
              placeholder="手机号（11位）"
              value={form.phone}
              onChange={(e) => onChange("phone", e.target.value)}
            />

            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-300"
                placeholder="6 位验证码"
                value={form.code}
                onChange={(e) => onChange("code", e.target.value)}
              />
              <button
                type="button"
                disabled={sending || seconds > 0}
                onClick={sendCode}
                className="whitespace-nowrap rounded-lg border border-purple-200 px-4 py-3 text-sm text-purple-700 hover:bg-purple-50 disabled:opacity-50"
              >
                {seconds > 0 ? `${seconds}s 后重发` : "获取"}
              </button>
            </div>
          </div>

          <input
            type="text"
            className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-300"
            placeholder="职级（如：部门负责人 / 经理 / 员工）"
            value={form.title}
            onChange={(e) => onChange("title", e.target.value)}
          />

          <input
            className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-300"
            placeholder="密码（至少 8 位）"
            type="password"
            value={form.password}
            onChange={(e) => onChange("password", e.target.value)}
          />

          <input
            className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-300"
            placeholder="再次输入密码"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => onChange("confirmPassword", e.target.value)}
          />

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={form.agree as boolean}
              onChange={(e) => onChange("agree", e.target.checked)}
            />
            我已阅读并同意
            <a className="text-purple-700 hover:underline" href="#" onClick={(e)=>e.preventDefault()}>《服务协议》</a>
            与
            <a className="text-purple-700 hover:underline" href="#" onClick={(e)=>e.preventDefault()}>《隐私政策》</a>
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-4 py-3 text-white shadow hover:opacity-95 disabled:opacity-50"
        >
          {submitting ? "提交中..." : "注册并登录"}
        </button>

        <div className="mt-3 text-center text-sm text-gray-500">
          已有账号？
          <a href="/login" className="text-purple-700 hover:underline ml-1">
            去登录
          </a>
        </div>
      </form>
    </div>
  );
}
