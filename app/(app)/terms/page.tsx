import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TermsSearch } from "@/components/terms-search";

export default async function TermsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; lang?: string; imported?: string; skipped?: string }>;
}) {
  const { q, lang, imported, skipped } = await searchParams;
  const supabase = await createClient();

  const { data: languages } = await supabase
    .from("languages")
    .select("*")
    .order("name");

  let query = supabase
    .from("terms")
    .select(
      `
      id,
      source_term,
      definition,
      part_of_speech,
      domain,
      updated_at,
      source_language:languages!terms_source_language_id_fkey(id, code, name)
    `
    )
    .order("source_term");

  if (lang) {
    query = query.eq("source_language_id", lang);
  }

  if (q) {
    query = query.ilike("source_term", `%${q}%`);
  }

  const { data: terms } = await query;

  return (
    <div>
      {imported !== undefined && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Import complete: <strong>{imported}</strong> term
          {imported === "1" ? "" : "s"} added.
          {Number(skipped ?? 0) > 0 && (
            <> <strong>{skipped}</strong> row{skipped === "1" ? "" : "s"} skipped.</>
          )}
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Glossary</h1>
          <p className="text-sm text-[var(--muted)]">
            {terms?.length ?? 0} term{terms?.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/terms/new"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
        >
          Add term
        </Link>
      </div>

      <TermsSearch languages={languages ?? []} initialQuery={q} initialLang={lang} />

      <div className="mt-6 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-white">
        {terms?.length === 0 && (
          <p className="p-8 text-center text-sm text-[var(--muted)]">
            No terms yet.{" "}
            <Link href="/terms/new" className="text-[var(--accent)] hover:underline">
              Add your first term
            </Link>
          </p>
        )}
        {terms?.map((term) => {
          const sourceLang = Array.isArray(term.source_language)
            ? term.source_language[0]
            : term.source_language;
          return (
            <Link
              key={term.id}
              href={`/terms/${term.id}`}
              className="flex items-start justify-between gap-4 px-4 py-3 hover:bg-stone-50"
            >
              <div>
                <p className="font-medium">{term.source_term}</p>
                {term.definition && (
                  <p className="mt-0.5 line-clamp-1 text-sm text-[var(--muted)]">
                    {term.definition}
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right text-xs text-[var(--muted)]">
                <span className="rounded bg-stone-100 px-1.5 py-0.5 uppercase">
                  {sourceLang?.code ?? "?"}
                </span>
                {term.part_of_speech && (
                  <p className="mt-1 capitalize">{term.part_of_speech}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
