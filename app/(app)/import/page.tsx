import { importGlossary } from "@/app/actions";

export default async function ImportPage({
  searchParams,
}: {
  searchParams: Promise<{ imported?: string; skipped?: string }>;
}) {
  const { imported, skipped } = await searchParams;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Import glossary</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Paste a public Google Sheets URL. The first row must be headers, with{" "}
        <span className="font-medium">EN</span> and{" "}
        <span className="font-medium">ES</span> columns (and optionally{" "}
        <span className="font-medium">Notes</span>). English terms become
        source terms; Spanish column becomes their translations.
      </p>

      {imported !== undefined && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Import complete: <strong>{imported}</strong> term
          {imported === "1" ? "" : "s"} added.
          {Number(skipped ?? 0) > 0 && (
            <> <strong>{skipped}</strong> row{skipped === "1" ? "" : "s"} skipped.</>
          )}
        </div>
      )}

      <form action={importGlossary} className="mt-6 space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Google Sheets URL
          </label>
          <input
            name="sheet_url"
            type="url"
            required
            defaultValue="https://docs.google.com/spreadsheets/d/15gf99WuzKd3LfbF1MlY39If2LG6XIhSmgb_3fSneoqo/edit"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
        >
          Import glossary
        </button>
      </form>
    </div>
  );
}
