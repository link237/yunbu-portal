import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/brand";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-4">{SITE_NAME}</h1>
      <p className="mb-6 text-center text-gray-700">{SITE_TAGLINE}</p>
      <div className="space-x-4">
        <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded">登录</Link>
        <Link href="/register" className="px-4 py-2 bg-green-600 text-white rounded">注册</Link>
      </div>
    </main>
  );
}
