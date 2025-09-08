import Link from "next/link";
import { SITE_NAME } from "@/lib/brand";

interface TopbarProps {
  teamName?: string;
}

/** 顶部导航栏组件 */
const Topbar: React.FC<TopbarProps> = ({ teamName }) => {
  return (
    <header className="w-full flex items-center justify-between bg-white border-b px-4 py-2">
      {/* 左侧：项目名称（及团队名称） */}
      <div className="text-lg font-semibold">
        {SITE_NAME}
        {teamName && <span className="text-sm text-gray-600 ml-2">({teamName})</span>}
      </div>
      {/* 右侧：注销按钮 */}
      <Link href="/api/auth/logout" className="text-sm text-gray-600 hover:text-gray-900">
        退出
      </Link>
    </header>
  );
};

export default Topbar;
