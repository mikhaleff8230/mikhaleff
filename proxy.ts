import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { browserLocale } from "@/lib/i18n/browser-locale";

export function proxy(request: NextRequest) {
  const locale = browserLocale(request.headers.get("accept-language"));
  return NextResponse.redirect(new URL(`/${locale}`, request.url));
}

export const config = { matcher: ["/"] };