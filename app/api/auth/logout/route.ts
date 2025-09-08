import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ message: "已退出登录" });
  res.cookies.set({ name: "token", value: "", path: "/", maxAge: 0 });
  return res;
}
