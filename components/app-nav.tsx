"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/terms", label: "Glossary" },
  { href: "/import", label: "Import" },
  { href: "/projects", label: "Projects" },
  { href: "/clients", label: "Clients" },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-[var(--border)] bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <Link href="/terms" className="text-lg font-semibold tracking-tight">
            LexiBase
          </Link>
          <nav className="flex gap-1">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-1.5 text-sm ${
                    active
                      ? "bg-blue-50 font-medium text-[var(--accent)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <button
          onClick={signOut}
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
