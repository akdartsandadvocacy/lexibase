import { createClient } from "@/lib/supabase/server";
import { createClientRecord } from "@/app/actions";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("name");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <p className="text-sm text-[var(--muted)]">
          People and companies you translate for
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          action={createClientRecord}
          className="space-y-3 rounded-xl border border-[var(--border)] bg-white p-6"
        >
          <h2 className="font-medium">Add client</h2>
          <input name="name" required placeholder="Client name" />
          <input name="contact_email" type="email" placeholder="Email (optional)" />
          <textarea name="notes" rows={2} placeholder="Notes (optional)" />
          <button
            type="submit"
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
          >
            Save client
          </button>
        </form>

        <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-white">
          {clients?.length === 0 && (
            <p className="p-6 text-sm text-[var(--muted)]">No clients yet.</p>
          )}
          {clients?.map((client) => (
            <div key={client.id} className="px-4 py-3">
              <p className="font-medium">{client.name}</p>
              {client.contact_email && (
                <p className="text-sm text-[var(--muted)]">{client.contact_email}</p>
              )}
              {client.notes && (
                <p className="mt-1 text-sm text-[var(--muted)]">{client.notes}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
