"use client";

export function DeleteButton({ label }: { label: string }) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm(`Are you sure you want to ${label.toLowerCase()}?`)) {
          e.preventDefault();
        }
      }}
      className="text-sm text-[var(--danger)] hover:underline"
    >
      {label}
    </button>
  );
}
