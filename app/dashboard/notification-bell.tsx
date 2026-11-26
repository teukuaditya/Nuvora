"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Notif = {
  id: string;
  title: string;
  detail: string;
  at: string;
  read?: boolean;
};

function fmtTime(iso: string) {
  try {
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function NotificationBell({ businessId, initial }: { businessId: string; initial: Notif[] }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>(initial);
  const unread = useMemo(() => items.filter((i) => !i.read).length, [items]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`bookings-notif-${businessId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bookings", filter: `business_id=eq.${businessId}` },
        (payload) => {
          const row = payload.new as { id?: string; customer_name?: string; starts_at?: string; status?: string };
          const notif: Notif = {
            id: row.id || crypto.randomUUID(),
            title: "Booking baru",
            detail: `${row.customer_name || "Pelanggan"}${row.starts_at ? ` · ${fmtTime(row.starts_at)}` : ""}`,
            at: new Date().toISOString(),
            read: false,
          };
          setItems((prev) => [notif, ...prev].slice(0, 10));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId]);

  function markRead() {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); if (!open) markRead(); }}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-stone-400 transition-colors hover:bg-stone-50 hover:text-stone-800 dark:hover:bg-surface-alt dark:hover:text-foreground"
        aria-label="Notifikasi"
      >
        {unread > 0 ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-background" /> : null}
        <Bell size={20} />
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl dark:border-border dark:bg-surface">
          <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3 dark:border-border">
            <p className="text-sm font-bold text-foreground">Notifikasi</p>
            <button type="button" onClick={() => setOpen(false)} className="text-stone-400 hover:text-foreground"><X size={16} /></button>
          </div>
          <div className="max-h-80 overflow-auto">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted">Belum ada notifikasi.</p>
            ) : items.map((n) => (
              <div key={n.id} className="border-b border-stone-100 px-4 py-3 last:border-0 dark:border-border">
                <p className="text-sm font-semibold text-foreground">{n.title}</p>
                <p className="text-xs text-muted">{n.detail}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
