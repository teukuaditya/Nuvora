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
    <div className="flex flex-col gap-2 sm:flex-row">
      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
        {copied ? "Tersalin" : "Salin link"}
      </button>
      <a
        href={bookingPath}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ExternalLink size={16} aria-hidden="true" />
        Buka halaman
      </a>
    </div>
  );
}
