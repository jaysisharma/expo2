"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { QrCode, Copy, CheckCircle2, Trash2, Download } from "lucide-react";
import { sourceLabel } from "@/lib/attribution";

interface ShortLink {
  code: string;
  path: string;
  source: string;
  campaign: string;
  clicks: number;
  createdAt: string;
}

/** Short links (/go/:code) + QR codes for posters, banners, print and social bios. */
export default function ShortLinksPanel({ path, source, campaign }: { path: string; source: string; campaign: string }) {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const load = async () => {
    try {
      const res = await fetch("/api/admin/short-links", { cache: "no-store" });
      const json = await res.json();
      if (json.success) setLinks(json.links);
    } catch {}
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/short-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, path, source, campaign }),
      });
      const json = await res.json();
      if (json.success) {
        setCode("");
        await load();
      } else {
        setError(json.message || "Could not create the short link");
      }
    } catch {
      setError("Could not create the short link");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (c: string) => {
    if (!confirm(`Delete /go/${c}? Printed QR codes using it will stop working.`)) return;
    await fetch(`/api/admin/short-links?code=${encodeURIComponent(c)}`, { method: "DELETE" });
    load();
  };

  const copy = async (c: string) => {
    try {
      await navigator.clipboard.writeText(`${origin}/go/${c}`);
      setCopied(c);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  };

  const downloadQr = async (c: string) => {
    const url = await QRCode.toDataURL(`${origin}/go/${c}`, {
      width: 1024,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#04281E", light: "#FFFFFF" },
    });
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${c}.png`;
    a.click();
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-xs p-4 space-y-3">
      <div className="flex items-center gap-2">
        <QrCode className="w-4 h-4 text-[#218A59]" />
        <h2 className="text-sm font-bold text-slate-900">Short links &amp; QR codes</h2>
      </div>
      <p className="text-xs text-slate-500">
        Turns the link above into a short, memorable link (e.g. <span className="font-mono">{origin}/go/fb-gala</span>) that counts
        clicks. Download a QR code for posters, banners, brochures and stall signage — offline promotion then shows up in the
        stats too.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex flex-1 min-w-0 items-center rounded-xl border border-slate-200 focus-within:border-[#218A59] overflow-hidden">
          <span className="pl-3 text-xs font-mono text-slate-400 shrink-0">/go/</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            placeholder="fb-gala (optional)"
            className="flex-1 min-w-0 px-1 py-2 text-xs font-mono text-slate-800 focus:outline-none"
          />
        </div>
        <button
          onClick={create}
          disabled={busy}
          className="px-3.5 py-2 rounded-xl bg-[#218A59] hover:bg-[#1b7349] disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
        >
          {busy ? "Creating…" : `Create for ${path} · ${sourceLabel(source)}${campaign ? ` · ${campaign}` : ""}`}
        </button>
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}

      {links.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[10px] font-mono font-bold text-slate-500 uppercase">
                <th className="py-2 pr-3">Short link</th>
                <th className="py-2 pr-3">Goes to</th>
                <th className="py-2 pr-3 text-right">Clicks</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.code} className="border-t border-slate-100">
                  <td className="py-2 pr-3 font-mono text-slate-800 whitespace-nowrap">/go/{l.code}</td>
                  <td className="py-2 pr-3 text-slate-600">
                    <span className="font-mono">{l.path}</span>
                    <span className="block text-[10px] text-slate-400">
                      {sourceLabel(l.source)}
                      {l.campaign ? ` · ${l.campaign}` : ""}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-right font-mono text-slate-700">{l.clicks || 0}</td>
                  <td className="py-2">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => copy(l.code)} title="Copy link" className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
                        {copied === l.code ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      </button>
                      <button onClick={() => downloadQr(l.code)} title="Download QR code" className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                      <button onClick={() => remove(l.code)} title="Delete" className="p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
