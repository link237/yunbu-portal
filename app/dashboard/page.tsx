"use client";

import { useEffect, useState } from "react";
import { SITE_NAME } from "@/lib/brand";

interface PortalApp {
  id: string;
  name: string;
  url: string;
  isExternal: boolean;
  canUse: boolean;
}

export default function DashboardPage() {
  const [apps, setApps] = useState<PortalApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      const res = await fetch("/api/apps/visible", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setApps(data);
      }
      setLoading(false);
    };
    fetchApps();
  }, []);

  if (loading) return <p className="p-6">加载中...</p>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-1">{SITE_NAME} · 可用应用</h1>
      <p className="text-gray-600 mb-4">根据团队默认与个人覆盖权限为你展示。</p>
      {apps.length === 0 ? (
        <p>当前没有可用的应用。</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apps.map(app => (
            <li key={app.id} className="border p-4 rounded">
              <h2 className="font-medium text-lg">{app.name}</h2>
              {app.isExternal ? (
                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-block mt-2 px-3 py-1 text-sm ${app.canUse ? "bg-blue-500 text-white" : "bg-gray-400 text-gray-800 cursor-not-allowed"}`}
                >
                  访问应用
                </a>
              ) : (
                <a
                  href={app.url}
                  className={`inline-block mt-2 px-3 py-1 text-sm ${app.canUse ? "bg-blue-500 text-white" : "bg-gray-400 text-gray-800 cursor-not-allowed"}`}
                >
                  进入应用
                </a>
              )}
              {!app.canUse && <p className="text-xs text-gray-600 mt-1">（无使用权限）</p>}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
