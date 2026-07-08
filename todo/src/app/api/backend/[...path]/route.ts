import { proxyApiRequest } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

async function handler(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;

  return proxyApiRequest(request, path);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
