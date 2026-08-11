import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createTerm } from "@/app/actions";
import { PARTS_OF_SPEECH } from "@/lib/types";

export default async function NewTermPage() {
  const supabase = await createClient();
  const { data: languages } = await supabase
    .from("languages")
    .select("*")
    .order("name");

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link
          href="/terms"
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          ← Back to glossary
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Add term</h1>
      </div>

      <form
        action={createTerm}
        className="space-y-4 rounded-xl border border-[var(--border)] bg-white p-6"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">Source language</label>
          <select name="source_language_id" required defaultValue="">
            <option value="" disabled>
              Select language
            </option>
            {languages?.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name} ({lang.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Term</label>
          <input name="source_term" required placeholder="e.g. birth plan" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Definition</label>
          <textarea name="definition" rows={3} placeholder="What does it mean?" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Part of speech</label>
            <select name="part_of_speech" defaultValue="">
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
            <input name="domain" placeholder="e.g. medical" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Notes</label>
          <textarea name="notes" rows={2} placeholder="Private notes" />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-[var(--accent)] py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
        >
          Save term
        </button>
      </form>
    </div>
  );
}
