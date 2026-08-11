import { createClient } from "@/lib/supabase/server";
import { createProject } from "@/app/actions";
import { PROJECT_STATUSES } from "@/lib/types";

export default async function ProjectsPage() {
  const supabase = await createClient();

  const [{ data: projects }, { data: clients }, { data: languages }] =
    await Promise.all([
      supabase
        .from("projects")
        .select(
          `
          *,
          source_language:languages!projects_source_language_id_fkey(code, name),
          target_language:languages!projects_target_language_id_fkey(code, name),
          client:clients(name)
        `
        )
        .order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name").order("name"),
      supabase.from("languages").select("*").order("name"),
    ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="text-sm text-[var(--muted)]">
          Translation jobs linked to clients and language pairs
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          action={createProject}
          className="space-y-3 rounded-xl border border-[var(--border)] bg-white p-6"
        >
          <h2 className="font-medium">New project</h2>
          <input name="name" required placeholder="Project name" />
          <select name="client_id" defaultValue="">
            <option value="">No client</option>
            {clients?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <select name="source_language_id" required defaultValue="">
              <option value="" disabled>
                Source
              </option>
              {languages?.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.code.toUpperCase()}
                </option>
              ))}
            </select>
            <select name="target_language_id" required defaultValue="">
              <option value="" disabled>
                Target
              </option>
              {languages?.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.code.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <input name="domain" placeholder="Domain (e.g. medical)" />
          <select name="status" defaultValue="active">
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
          >
            Create project
          </button>
        </form>

        <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-white">
          {projects?.length === 0 && (
            <p className="p-6 text-sm text-[var(--muted)]">No projects yet.</p>
          )}
          {projects?.map((project) => {
            const src = Array.isArray(project.source_language)
              ? project.source_language[0]
              : project.source_language;
            const tgt = Array.isArray(project.target_language)
              ? project.target_language[0]
              : project.target_language;
            const client = Array.isArray(project.client)
              ? project.client[0]
              : project.client;

            return (
              <div key={project.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{project.name}</p>
                  <span className="shrink-0 rounded bg-stone-100 px-1.5 py-0.5 text-xs capitalize">
                    {project.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {src?.code?.toUpperCase()} → {tgt?.code?.toUpperCase()}
                  {client?.name && ` · ${client.name}`}
                  {project.domain && ` · ${project.domain}`}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
