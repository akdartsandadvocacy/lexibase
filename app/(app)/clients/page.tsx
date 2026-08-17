import { createClient } from "@/lib/supabase/server";
import { createClientRecord } from "@/app/actions";
import { REQUEST_TYPES } from "@/lib/types";

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
          {clients?.length ?? 0} client{(clients?.length ?? 0) === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <form
          action={createClientRecord}
          className="space-y-3 rounded-xl border border-[var(--border)] bg-white p-6"
        >
          <h2 className="font-medium">Add client</h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium">Client name</label>
              <input name="name" required placeholder="Acme Corp" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Contact email</label>
              <input name="contact_email" type="email" placeholder="john@example.com" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Contact phone</label>
              <input name="contact_phone" type="tel" placeholder="+1-212-555-0101" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Date of contact</label>
              <input name="date_of_contact" type="date" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Request type</label>
              <select name="request_type" defaultValue="">
                <option value="" disabled>
                  Select type
                </option>
                {REQUEST_TYPES.map((rt) => (
                  <option key={rt} value={rt}>
                    {rt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Language pairs</label>
              <input name="language_pairs" placeholder="EN ⇄ ES" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Event / due date</label>
              <input name="event_or_due_date" type="date" />
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium">Notes</label>
              <textarea name="notes" rows={2} placeholder="Additional notes" />
            </div>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
          >
            Save client
          </button>
        </form>

        <div className="space-y-3">
          {clients?.length === 0 && (
            <p className="rounded-xl border border-[var(--border)] bg-white p-6 text-center text-sm text-[var(--muted)]">
              No clients yet.
            </p>
          )}
          {clients?.map((client) => (
            <div
              key={client.id}
              className="rounded-xl border border-[var(--border)] bg-white p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{client.name}</p>
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-[var(--muted)]">
                    {client.contact_email && (
                      <p className="col-span-2 truncate">{client.contact_email}</p>
                    )}
                    {client.contact_phone && <p>{client.contact_phone}</p>}
                    {client.date_of_contact && (
                      <p>Contacted: {new Date(client.date_of_contact + "T00:00:00").toLocaleDateString()}</p>
                    )}
                    {client.request_type && (
                      <p>
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-[var(--accent)]">
                          {client.request_type}
                        </span>
                      </p>
                    )}
                    {client.language_pairs && <p>{client.language_pairs}</p>}
                    {client.event_or_due_date && (
                      <p>Due: {new Date(client.event_or_due_date + "T00:00:00").toLocaleDateString()}</p>
                    )}
                  </div>
                  {client.notes && (
                    <p className="mt-2 text-sm text-[var(--muted)]">{client.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
