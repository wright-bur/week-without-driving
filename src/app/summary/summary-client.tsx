"use client";

import { useEffect, useRef, useState } from "react";
import { ensureAccessToken } from "@/lib/supabase/session";

type SummaryData = {
  replacedCount: number;
  skippedCount: number;
  nearBreakCount: number;
  topTags: string[];
  topSurprises: string[];
  shareText: string;
};

function drawShareCard(canvas: HTMLCanvasElement, summary: SummaryData) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const width = 1080;
  const height = 1080;
  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = "#f7f3ee";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#e7d9cf";
  ctx.fillRect(0, 0, width, 140);

  ctx.fillStyle = "#171717";
  ctx.font = "600 40px Newsreader, serif";
  ctx.fillText("Week Without Driving", 80, 100);

  ctx.font = "500 32px Sora, sans-serif";
  ctx.fillText("Confessional Summary", 80, 170);

  ctx.font = "500 34px Newsreader, serif";
  const lines = [
    `Trips replaced: ${summary.replacedCount}`,
    `Trips skipped: ${summary.skippedCount}`,
    `Near-break moments: ${summary.nearBreakCount}`,
    summary.topTags.length
      ? `Most common stressor: ${summary.topTags.join(", ")}`
      : "Most common stressor: (none)",
    summary.topSurprises.length
      ? `Most common surprise: ${summary.topSurprises.join(", ")}`
      : "Most common surprise: (none)"
  ];

  let y = 300;
  lines.forEach((line) => {
    ctx.fillText(line, 80, y);
    y += 70;
  });

  ctx.fillStyle = "#7f6f66";
  ctx.font = "500 26px Sora, sans-serif";
  ctx.fillText("Not a streak. A reckoning.", 80, height - 120);
}

export default function SummaryClient() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const accessToken = await ensureAccessToken();
        if (!accessToken) throw new Error("Missing session.");

        const response = await fetch("/api/summary", {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        if (!response.ok) {
          throw new Error("Unable to load your summary.");
        }
        const data = (await response.json()) as SummaryData;
        setSummary(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  useEffect(() => {
    if (summary && canvasRef.current) {
      drawShareCard(canvasRef.current, summary);
    }
  }, [summary]);

  const handleCopy = async () => {
    if (!summary) return;
    await navigator.clipboard.writeText(summary.shareText);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "week-without-driving-summary.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const handleShare = async () => {
    if (!summary) return;
    if (navigator.share) {
      await navigator.share({ text: summary.shareText });
    } else {
      await handleCopy();
      alert("Share text copied to clipboard.");
    }
  };

  const handleWithdraw = async () => {
    if (!summary) return;
    setWithdrawing(true);
    setError(null);
    try {
      const accessToken = await ensureAccessToken();
      if (!accessToken) {
        throw new Error("Missing session.");
      }
      const response = await fetch("/api/withdraw", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      if (!response.ok) throw new Error("Unable to withdraw consent.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return <p className="text-dusk">Loading your summary...</p>;
  }

  if (error) {
    return <p className="text-ember">{error}</p>;
  }

  if (!summary) {
    return <p className="text-ember">No summary data found yet.</p>;
  }

  return (
    <div className="space-y-8">
      <section className="section-card grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-dusk">
            This week
          </p>
          <h2 className="font-serif text-3xl text-ink">Your reflection</h2>
        </div>
        <div className="space-y-3 text-lg text-ink/80">
          <p>Trips replaced: {summary.replacedCount}</p>
          <p>Trips skipped: {summary.skippedCount}</p>
          <p>Near-break moments: {summary.nearBreakCount}</p>
          <p>
            Most common stressor: {summary.topTags.join(", ") || "(none)"}
          </p>
          <p>
            Most common surprise: {summary.topSurprises.join(", ") || "(none)"}
          </p>
        </div>
      </section>

      <section className="section-card space-y-4">
        <h2 className="font-serif text-2xl">Share card</h2>
        <p className="text-sm text-dusk">
          Share the reflection, not the data trail.
        </p>
        <div className="overflow-hidden rounded-3xl border border-amber-200/60 bg-white/80 p-4">
          <canvas ref={canvasRef} className="w-full" />
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="btn-secondary" onClick={handleCopy}>
            Copy text
          </button>
          <button className="btn-secondary" onClick={handleDownload}>
            Download image
          </button>
          <button className="btn-primary" onClick={handleShare}>
            Share
          </button>
        </div>
      </section>

      <section className="section-card space-y-4">
        <h2 className="font-serif text-2xl">Withdraw consent</h2>
        <p className="text-sm text-dusk">
          You can revoke permission and remove your pending/approved cards from
          the public scroll.
        </p>
        <button
          className="btn-secondary"
          onClick={handleWithdraw}
          disabled={withdrawing}
        >
          {withdrawing ? "Withdrawing..." : "Withdraw my cards"}
        </button>
      </section>
    </div>
  );
}
