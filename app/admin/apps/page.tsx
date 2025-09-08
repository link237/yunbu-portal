"use client";

import { useEffect, useState } from "react";

interface AppItem {
  id: string;
  name: string;
  defaultCanView: boolean;
  defaultCanUse: boolean;
}

export default function AdminAppsPage() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApps = async () => {
      const res = await fetch("/api/admin/apps", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setApps(data);
      }
    };
    fetchApps();
  }, []);

  const updatePermission = async (appId: string, defaultCanView: boolean, defaultCanUse: boolean) => {
    setError("");
    const res = await fetch("/api/admin/apps", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId, defaultCanView, defaultCanUse })
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "更新失败");
    } else {
      setApps(prev => prev.map(app => app.id === appId ? { ...app, defaultCanView, defaultCanUse } : app));
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">团队应用权限配置</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <table className="min-w-full text-left border">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="p-2">应用</th>
            <th className="p-2">默认可见</th>
            <th className="p-2">默认可用</th>
            <th className="p-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {apps.map(app => (
            <tr key={app.id} className="border-b">
              <td className="p-2">{app.name}</td>
              <td className="p-2">
                <input
                  type="checkbox"
                  checked={app.defaultCanView}
                  onChange={(e) => setApps(prev => prev.map(a => a.id === app.id ? { ...a, defaultCanView: e.target.checked } : a))}
                />
              </td>
              <td className="p-2">
                <input
                  type="checkbox"
                  checked={app.defaultCanUse}
                  onChange={(e) => setApps(prev => prev.map(a => a.id === app.id ? { ...a, defaultCanUse: e.target.checked } : a))}
                />
              </td>
              <td className="p-2">
                <button
                  className="text-blue-600 underline"
                  onClick={() => updatePermission(app.id, app.defaultCanView, app.defaultCanUse)}
                >
                  更新
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
