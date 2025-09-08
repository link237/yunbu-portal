import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // 清除认证 Cookie 并重定向到登录页
  const res = NextResponse.redirect("/login");
  res.cookies.set("token", "", { path: "/", maxAge: 0 });
  return res;
}
