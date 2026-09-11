import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  const target = url.searchParams.get("redirect") || "/en";
  if (!process.env.SANITY_PREVIEW_SECRET || secret !== process.env.SANITY_PREVIEW_SECRET) return new Response("Invalid preview secret", { status: 401 });
  const safeTarget = target.startsWith("/") && !target.startsWith("//") ? target : "/en";
  (await draftMode()).enable();
  redirect(safeTarget);
}
