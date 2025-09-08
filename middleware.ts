// middleware.ts
import { NextResponse, NextRequest } from "next/server";
import { verifyJWT } from "@/lib/auth";

const PUBLIC = ["/", "/login", "/register", "/api/auth", "/favicon", "/_next", "/icons"];
const isPublic = (p: string) => PUBLIC.some(x => p === x || p.startsWith(x));

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 为 Codespaces/反向代理修正 Origin/Host，避免 Server Action 校验失败
  const fwdHost = request.headers.get("x-forwarded-host");
  const fwdProto = request.headers.get("x-forwarded-proto") || "https";
  const reqHeaders = new Headers(request.headers);
  if (fwdHost) {
    reqHeaders.set("host", fwdHost);
    reqHeaders.set("origin", `${fwdProto}://${fwdHost}`);
  }

  if (isPublic(pathname)) {
    return NextResponse.next({ request: { headers: reqHeaders } });
  }

  const protectedRoute =
    pathname.startsWith("/portal") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api");

  if (!protectedRoute) {
    return NextResponse.next({ request: { headers: reqHeaders } });
  }

  const token = request.cookies.get("token")?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.startsWith("/api") ? "/api/auth/unauthorized" : "/login";
    return pathname.startsWith("/api")
      ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      : NextResponse.redirect(url);
  }

  const payload = verifyJWT(token);
  if (!payload?.userId) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return pathname.startsWith("/api")
      ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      : NextResponse.redirect(url);
  }

  // 关键：把用户上下文写进请求头，给服务器组件用
  reqHeaders.set("x-user-id", payload.userId);
  if (payload.teamId) reqHeaders.set("x-team-id", payload.teamId);
  reqHeaders.set("x-is-admin", payload.isAdmin ? "true" : "false");

  const res = NextResponse.next({ request: { headers: reqHeaders } });

  // 如果没有 teamId cookie，但 token 里有，补一份
  if (!request.cookies.get("teamId")?.value && payload.teamId) {
    res.cookies.set("teamId", payload.teamId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: true, // Codespaces 是 https
    });
  }

  return res;
}

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*", "/api/:path*"],
};
