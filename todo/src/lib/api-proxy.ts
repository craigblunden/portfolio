import { NextRequest } from "next/server";

const getApiBaseUrl = () => {
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("Missing API URL. Set API_URL or NEXT_PUBLIC_API_URL.");
  }

  return apiUrl.replace(/\/$/, "");
};

const getForwardedProto = (request: NextRequest) => {
  return (
    request.headers.get("x-forwarded-proto") ??
    new URL(request.url).protocol.replace(":", "")
  );
};

export async function proxyApiRequest(
  request: NextRequest,
  path: string[],
  prefix: string[] = [],
) {
  const incomingUrl = new URL(request.url);
  const backendPath = [...prefix, ...path].map(encodeURIComponent).join("/");
  const backendUrl = `${getApiBaseUrl()}/${backendPath}${incomingUrl.search}`;

  const headers = new Headers(request.headers);
  headers.set("x-forwarded-host", request.headers.get("host") ?? incomingUrl.host);
  headers.set("x-forwarded-proto", getForwardedProto(request));
  headers.delete("host");
  headers.delete("content-length");

  const response = await fetch(backendUrl, {
    method: request.method,
    headers,
    body: request.body,
    redirect: "manual",
    // Required when forwarding a streaming request body in Node.js fetch.
    duplex: "half",
  } as RequestInit & { duplex: "half" });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
