"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type TickerCard = {
  id: string;
  text: string;
  card_type: string;
  tags: string[];
};

export default function ScrollTicker() {
  const [cards, setCards] = useState<TickerCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/scroll?limit=24&page=0");
        if (!response.ok) return;
        const payload = (await response.json()) as { cards: TickerCard[] };
        setCards(payload.cards ?? []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const loopCards = useMemo(() => {
    if (!cards.length) return [];
    return [...cards, ...cards];
  }, [cards]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-amber-200/60 bg-white/70 p-6 text-sm text-dusk">
        Loading the confessional ticker...
      </div>
    );
  }

  if (!cards.length) {
    return (
      <div className="rounded-3xl border border-amber-200/60 bg-white/70 p-6 text-sm text-dusk">
        No approved cards yet. Check back soon.
      </div>
    );
  }

  return (
    <div className="ticker-shell">
      <div className="ticker-track">
        {loopCards.map((card, index) => (
          <article
            key={`${card.id}-${index}`}
            className={cn(
              "ticker-card",
              index % 2 === 0 ? "ticker-card-alt" : ""
            )}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-dusk">
              {card.card_type}
            </p>
            <div className="mt-3 space-y-2 text-base text-ink">
              {card.text
                .split("\n")
                .filter(Boolean)
                .slice(0, 3)
                .map((line, lineIndex) => (
                  <p key={lineIndex} className="leading-relaxed">
                    {line}
                  </p>
                ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-dusk">
              {card.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="tag-chip">
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
