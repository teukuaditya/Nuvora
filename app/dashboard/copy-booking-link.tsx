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
    <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-garis bg-putih p-3 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1 rounded-xl bg-porselen px-4 py-3">
        <p className="text-xs font-medium text-[#5b6b80]">Link booking</p>
        <p className="truncate font-display text-base font-semibold text-tinta">{bookingPath}</p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-tinta px-4 py-2.5 text-sm font-medium text-putih transition-colors hover:bg-[#1a2940] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-biru-tiang focus-visible:ring-offset-2 sm:flex-none"
        >
          {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          {copied ? "Tersalin" : "Salin link"}
        </button>
        <a
          href={bookingPath}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-garis bg-putih px-4 py-2.5 text-sm font-medium text-tinta transition-colors hover:bg-porselen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-biru-tiang focus-visible:ring-offset-2 sm:flex-none"
        >
          <ExternalLink size={16} aria-hidden="true" />
          Buka halaman
        </a>
      </div>
    </div>
  );
}
