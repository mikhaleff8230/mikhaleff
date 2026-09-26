import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { browserLocale } from "@/lib/i18n/browser-locale";

export default async function RootPage() {
  const acceptLanguage = (await headers()).get("accept-language");
  redirect(`/${browserLocale(acceptLanguage)}`);
}