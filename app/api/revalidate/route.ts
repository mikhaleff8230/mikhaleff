import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const secret = request.headers.get("x-sanity-secret");
  if (!process.env.SANITY_REVALIDATE_SECRET || secret !== process.env.SANITY_REVALIDATE_SECRET) return NextResponse.json({ ok: false }, { status: 401 });
  let body: { paths?: string[] } = {};
  try { body = await request.json() as { paths?: string[] }; } catch { /* Revalidate the whole site below. */ }
  const paths = Array.isArray(body.paths) && body.paths.length ? body.paths.filter((path) => path.startsWith("/") && !path.startsWith("//")).slice(0, 50) : ["/"];
  paths.forEach((path) => revalidatePath(path));
  return NextResponse.json({ ok: true, revalidated: paths, now: Date.now() });
}
