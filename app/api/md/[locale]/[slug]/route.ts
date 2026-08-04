import { LOCALES, type Locale } from "@/lib/i18n";
import { renderMarkdown } from "@/lib/machine";

export const dynamic = "force-static";

/** Reached through the rewrites in next.config.ts: /index.md and /ko/index.md */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale, slug: "home" }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> },
): Promise<Response> {
  const { locale } = await params;
  if (!LOCALES.includes(locale as Locale)) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(renderMarkdown(locale as Locale), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
