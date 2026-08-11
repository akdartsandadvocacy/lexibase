"use client";

import { useRouter } from "next/navigation";
import type { Language } from "@/lib/types";

export function TermsSearch({
  languages,
  initialQuery,
  initialLang,
}: {
  languages: Language[];
  initialQuery?: string;
  initialLang?: string;
}) {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.elements.namedItem("q") as HTMLInputElement).value;
    const lang = (form.elements.namedItem("lang") as HTMLSelectElement).value;
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (lang) params.set("lang", lang);
    router.push(`/terms?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap gap-3 rounded-xl border border-[var(--border)] bg-white p-4"
    >
      <div className="min-w-[200px] flex-1">
        <input
          name="q"
          defaultValue={initialQuery ?? ""}
          placeholder="Search terms…"
        />
      </div>
      <div className="w-44">
        <select name="lang" defaultValue={initialLang ?? ""}>
          <option value="">All languages</option>
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm hover:bg-stone-50"
      >
        Search
      </button>
    </form>
  );
}
