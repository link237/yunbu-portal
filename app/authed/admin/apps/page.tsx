// app/(authed)/admin/apps/page.tsx
"use client";
import { useEffect, useState } from "react";

interface AppInfo {
  id: string;
  name: string;
  description?: string;
  defaultCanView: boolean;
  defaultCanUse: boolean;
}

export default function AppManagementPage() {
  const [apps, setApps] = useState<AppInfo[]>([]);

  useEffect(() => {
    // 获取所有应用及默认权限
    fetch("/api/admin/apps")
      .then(res => res.json())
      .then(data => setApps(data));
  }, []);

  const toggleApp = async (appId: string, newVisible: boolean) => {
    // 调用后端接口更新应用的上架/下架状态
    await fetch(`/api/admin/apps/${appId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defaultCanView: newVisible, defaultCanUse: newVisible })
    });
    // 更新本地状态
    setApps(apps.map(app =>
      app.id === appId ? { ...app, defaultCanView: newVisible, defaultCanUse: newVisible } : app
    ));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">应用管理</h2>
      {apps.length === 0 ? (
        <p>暂无应用。</p>
      ) : (
        <ul className="space-y-3">
          {apps.map(app => (
            <li key={app.id} className="flex items-center justify-between 
                                        p-4 border rounded bg-white">
              <div>
                <p className="font-medium">{app.name}</p>
                {app.description && (
                  <p className="text-sm text-gray-600">{app.description}</p>
                )}
              </div>
              <div>
                {/* 上架开关 */}
                <label className="mr-2 text-sm">
                  {app.defaultCanView ? "已上架" : "已下架"}
                </label>
                <input type="checkbox" className="toggle-checkbox"
                       checked={app.defaultCanView}
                       onChange={e => toggleApp(app.id, e.target.checked)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
