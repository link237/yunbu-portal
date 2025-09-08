import "@/app/globals.css";
import { Metadata } from "next";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/brand";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-100 text-gray-800">
        {children}
      </body>
    </html>
  );
}
