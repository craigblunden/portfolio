import { headers } from "next/headers";

export type AdminSession = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  email: string | null;
  name: string | null;
};

const signedOutSession: AdminSession = {
  isAuthenticated: false,
  isAdmin: false,
  email: null,
  name: null,
};

const getApiBaseUrl = () => {
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  return apiUrl?.replace(/\/$/, "");
};

export const getAdminSession = async (): Promise<AdminSession> => {
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl) {
    return signedOutSession;
  }

  const incomingHeaders = await headers();
  const requestHeaders = new Headers();
  const cookie = incomingHeaders.get("cookie");
  const host = incomingHeaders.get("host");
  const proto = incomingHeaders.get("x-forwarded-proto") ?? "http";

  if (cookie) {
    requestHeaders.set("cookie", cookie);
  }

  if (host) {
    requestHeaders.set("x-forwarded-host", host);
    requestHeaders.set("x-forwarded-proto", proto);
  }

  try {
    const response = await fetch(`${apiBaseUrl}/auth/me`, {
      headers: requestHeaders,
      cache: "no-store",
    });

    if (!response.ok) {
      return signedOutSession;
    }

    return (await response.json()) as AdminSession;
  } catch {
    return signedOutSession;
  }
};
