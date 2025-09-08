"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface AppPerm {
  appId: string;
  name: string;
  defaultCanView: boolean;
  defaultCanUse: boolean;
  overrideCanView: boolean | null;
  overrideCanUse: boolean | null;
  effectiveCanView: boolean;
  effectiveCanUse: boolean;
}

export default function UserAppsPage() {
  const params = useParams();
  const userId = params?.userId as string | undefined;
  const [userName, setUserName] = useState("");
  const [apps, setApps] = useState<AppPerm[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      const res = await fetch(`/api/admin/users/${userId}/apps`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUserName(data.user.name);
        setApps(data.apps);
      }
    };
    fetchData();
  }, [userId]);

  const updatePermission = async (appId: string, canView: boolean, canUse: boolean) => {
    setError("");
    const res = await fetch(`/api/admin/users/${userId}/apps`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId, canView, canUse })
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "更新失败");
    } else {
      setApps(prev => prev.map(app =>
        app.appId === appId ? { ...app, overrideCanView: canView, overrideCanUse: canUse, effectiveCanView: canView, effectiveCanUse: canUse } : app
      ));
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">用户应用权限配置{userName ? `：${userName}` : ""}</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <table className="min-w-full text-left border">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="p-2">应用</th>
            <th className="p-2">团队默认</th>
            <th className="p-2">用户当前</th>
            <th className="p-2">可见</th>
            <th className="p-2">可用</th>
            <th className="p-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {apps.map(app => (
            <tr key={app.appId} className="border-b">
              <td className="p-2">{app.name}</td>
              <td className="p-2">{app.defaultCanView ? "可见" : "不可见"} / {app.defaultCanUse ? "可用" : "不可用"}</td>
              <td className="p-2">{app.effectiveCanView ? "可见" : "不可见"} / {app.effectiveCanUse ? "可用" : "不可用"}</td>
              <td className="p-2">
                <input
                  type="checkbox"
                  checked={app.overrideCanView !== null ? app.overrideCanView : app.defaultCanView}
                  onChange={(e) => setApps(prev => prev.map(a => a.appId === app.appId ? { ...a, overrideCanView: e.target.checked } : a))}
                />
              </td>
              <td className="p-2">
                <input
                  type="checkbox"
                  checked={app.overrideCanUse !== null ? app.overrideCanUse : app.defaultCanUse}
                  onChange={(e) => setApps(prev => prev.map(a => a.appId === app.appId ? { ...a, overrideCanUse: e.target.checked } : a))}
                />
              </td>
              <td className="p-2">
                <button
                  className="text-blue-600 underline"
                  onClick={() =>
                    updatePermission(
                      app.appId,
                      app.overrideCanView !== null ? app.overrideCanView : app.defaultCanView,
                      app.overrideCanUse !== null ? app.overrideCanUse : app.defaultCanUse
                    )
                  }
                >
                  更新
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-sm text-gray-600">提示：要恢复默认权限，将覆盖值改为与默认一致并更新即可。</p>
    </main>
  );
}
