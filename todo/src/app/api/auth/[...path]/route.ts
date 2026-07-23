import { proxyApiRequest } from "@/lib/api-proxy";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

async function handler(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;

  if (path[0] === "logout") {
    const returnUrl = request.nextUrl.searchParams.get("returnUrl") ?? "/";
    const redirectUrl = new URL(
      returnUrl.startsWith("/") ? returnUrl : "/",
      request.url,
    );
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set("portfolio_admin", "", {
      maxAge: 0,
      path: "/",
    });
    response.headers.set("Cache-Control", "no-store");

    return response;
  }

  const response = await proxyApiRequest(request, path, ["auth"]);
  const location = response.headers.get("location");

  if (path[0] === "callback" && location) {
    const redirectedUrl = new URL(location, request.url);

    if (redirectedUrl.searchParams.get("auth") !== "denied") {
      return response;
    }

    const redirectUrl = new URL("/?auth=denied", request.url);
    const deniedResponse = NextResponse.redirect(redirectUrl);

    deniedResponse.cookies.set("portfolio_admin", "", {
      maxAge: 0,
      path: "/",
    });
    deniedResponse.headers.set("Cache-Control", "no-store");

    return deniedResponse;
  }

  return response;
}

export const GET = handler;
export const POST = handler;
