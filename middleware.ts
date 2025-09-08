// middleware.ts
import { NextResponse, NextRequest } from "next/server";
import { verifyJWT } from "@/lib/auth";

const PUBLIC_PREFIX = ["/_next", "/favicon", "/icons", "/api/auth"];
const PUBLIC_EXACT = ["/", "/login", "/register"];
const isPublic = (p: string) =>
  PUBLIC_EXACT.includes(p) || PUBLIC_PREFIX.some((x) => p.startsWith(x));

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);

  // Codespaces/反向代理：把 Forwarded 的 host/proto 回灌
  const fwdHost = request.headers.get("x-forwarded-host");
  const fwdProto = request.headers.get("x-forwarded-proto") || "https";
  if (fwdHost) {
    requestHeaders.set("origin", `${fwdProto}://${fwdHost}`);
    requestHeaders.set("host", fwdHost);
  }

  if (isPublic(pathname)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const isProtected =
    pathname.startsWith("/portal") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api");

  if (!isProtected) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const token = request.cookies.get("token")?.value;
  if (!token) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  let payload: any = null;
  try {
    payload = await Promise.resolve(verifyJWT(token));
  } catch {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (!payload?.userId) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ==== 关键点：把 teamId 兜底为 cookie 值 ====
  const cookieTeamId = request.cookies.get("teamId")?.value;
  const teamId = payload.teamId || cookieTeamId || "";

  requestHeaders.set("x-user-id", payload.userId);
  if (teamId) requestHeaders.set("x-team-id", teamId);
  requestHeaders.set("x-is-admin", payload.isAdmin ? "true" : "false");

  // admin 保护
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!payload.isAdmin) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const url = request.nextUrl.clone();
      url.pathname = "/portal";
      return NextResponse.redirect(url);
    }
  }

  const res = NextResponse.next({ request: { headers: requestHeaders } });

  // 如果 cookie 里还没有 teamId，但我们已经拿到了，就顺带补上
  if (!cookieTeamId && teamId) {
    res.cookies.set("teamId", teamId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }

  return res;
}

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*", "/api/:path*"],
};
