"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";

export function CopyBookingLink({ bookingPath }: { bookingPath: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}${bookingPath}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-6 py-3 text-sm font-bold text-stone-700 transition-all duration-300 hover:bg-stone-50 active:scale-95 dark:border-border dark:bg-surface dark:text-foreground dark:hover:bg-surface-alt"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? "Tersalin" : "Salin link"}
      </button>
      <a
        href={bookingPath}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-primary-dark to-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-200/50 transition-all duration-300 active:scale-95 dark:shadow-none"
      >
        <ExternalLink size={16} />
        Buka halaman
      </a>
    </div>
  );
}
