import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  addTranslation,
  deleteTerm,
  deleteTranslation,
  updateTerm,
} from "@/app/actions";
import { PARTS_OF_SPEECH, type Language, type TermTranslation } from "@/lib/types";
import { DeleteButton } from "@/components/delete-button";

export default async function TermDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: term } = await supabase
    .from("terms")
    .select(
      `
      *,
      source_language:languages!terms_source_language_id_fkey(*),
      term_translations(
        *,
        target_language:languages!term_translations_target_language_id_fkey(*)
      )
    `
    )
    .eq("id", id)
    .single();

  if (!term) notFound();

  const { data: languages } = await supabase
    .from("languages")
    .select("*")
    .order("name");

  const sourceLang = Array.isArray(term.source_language)
    ? term.source_language[0]
    : term.source_language;

  const translations: Array<TermTranslation & { target_language?: Language | null }> =
    (term.term_translations ?? []).map((tr: TermTranslation) => ({
      ...tr,
      target_language: Array.isArray(tr.target_language)
        ? tr.target_language[0]
        : tr.target_language,
    }));

  translations.sort((a, b) =>
    (a.target_language?.name ?? "").localeCompare(b.target_language?.name ?? "")
  );

  const usedLangIds = new Set(translations.map((t) => t.target_language_id));
  const availableTargetLangs = (languages ?? []).filter(
    (l) => l.id !== term.source_language_id && !usedLangIds.has(l.id)
  );

  return (
    <div className="max-w-2xl">
      <Link
        href="/terms"
        className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        ← Back to glossary
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{term.source_term}</h1>
          <p className="text-sm text-[var(--muted)]">
            {sourceLang?.name} · Updated{" "}
            {new Date(term.updated_at).toLocaleDateString()}
          </p>
        </div>
        <form action={deleteTerm.bind(null, id)}>
          <DeleteButton label="Delete term" />
        </form>
      </div>

      <form
        action={updateTerm.bind(null, id)}
        className="mt-6 space-y-4 rounded-xl border border-[var(--border)] bg-white p-6"
      >
        <h2 className="font-medium">Edit term</h2>

        <div>
          <label className="mb-1 block text-sm font-medium">Source language</label>
          <select
            name="source_language_id"
            required
            defaultValue={term.source_language_id}
          >
            {languages?.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name} ({lang.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Term</label>
          <input name="source_term" required defaultValue={term.source_term} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Definition</label>
          <textarea
            name="definition"
            rows={3}
            defaultValue={term.definition ?? ""}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Part of speech</label>
            <select name="part_of_speech" defaultValue={term.part_of_speech ?? ""}>
              <option value="">—</option>
              {PARTS_OF_SPEECH.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Domain</label>
            <input name="domain" defaultValue={term.domain ?? ""} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Notes</label>
          <textarea name="notes" rows={2} defaultValue={term.notes ?? ""} />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
        >
          Save changes
        </button>
      </form>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-medium">Translations</h2>

        {translations.length === 0 && (
          <p className="mb-4 text-sm text-[var(--muted)]">
            No translations yet. Add one below.
          </p>
        )}

        <div className="space-y-3">
          {translations.map((tr) => {
            const targetLang = tr.target_language;
            return (
              <div
                key={tr.id}
                className="rounded-xl border border-[var(--border)] bg-white p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium uppercase text-[var(--accent)]">
                      {targetLang?.code}
                    </span>
                    <p className="mt-1 text-lg font-medium">{tr.translation}</p>
                    {tr.context && (
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Context: {tr.context}
                      </p>
                    )}
                    {(tr.example_sentence_source || tr.example_sentence_target) && (
                      <div className="mt-2 space-y-1 text-sm">
                        {tr.example_sentence_source && (
                          <p>
                            <span className="text-[var(--muted)]">Source:</span>{" "}
                            {tr.example_sentence_source}
                          </p>
                        )}
                        {tr.example_sentence_target && (
                          <p>
                            <span className="text-[var(--muted)]">Target:</span>{" "}
                            {tr.example_sentence_target}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <form action={deleteTranslation.bind(null, tr.id, id)}>
                    <DeleteButton label="Remove" />
                  </form>
                </div>
              </div>
            );
          })}
        </div>

        {availableTargetLangs.length > 0 && (
          <form
            action={addTranslation.bind(null, id)}
            className="mt-4 space-y-3 rounded-xl border border-dashed border-[var(--border)] bg-stone-50 p-4"
          >
            <h3 className="text-sm font-medium">Add translation</h3>
            <div className="grid grid-cols-2 gap-3">
              <select name="target_language_id" required defaultValue="">
                <option value="" disabled>
                  Target language
                </option>
                {availableTargetLangs.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <input name="translation" required placeholder="Translation" />
            </div>
            <input name="context" placeholder="When to use this translation" />
            <input
              name="example_sentence_source"
              placeholder="Example sentence (source)"
            />
            <input
              name="example_sentence_target"
              placeholder="Example sentence (target)"
            />
            <button
              type="submit"
              className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm hover:bg-stone-50"
            >
              Add translation
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
