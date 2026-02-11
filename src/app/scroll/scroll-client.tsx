"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ConfessionalCard } from "@/components/ConfessionalCard";
import { filterCardTypes, filterTags } from "@/lib/constants";

type ScrollCard = {
  id: string;
  text: string;
  card_type: string;
  tags: string[];
  day: number | null;
};

const PAGE_SIZE = 16;

export default function ScrollClient() {
  const [cards, setCards] = useState<ScrollCard[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtersKey = useMemo(
    () => `${selectedTypes.join("|")}::${selectedTags.join("|")}`,
    [selectedTypes, selectedTags]
  );

  const fetchCards = async (pageNumber: number, append: boolean) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", pageNumber.toString());
    params.set("limit", PAGE_SIZE.toString());
    if (selectedTypes.length) params.set("types", selectedTypes.join(","));
    if (selectedTags.length) params.set("tags", selectedTags.join(","));

    const response = await fetch(`/api/scroll?${params.toString()}`);
    if (!response.ok) {
      setLoading(false);
      return;
    }
    const payload = (await response.json()) as {
      cards: ScrollCard[];
      hasMore: boolean;
    };
    setCards((prev) => (append ? [...prev, ...payload.cards] : payload.cards));
    setHasMore(payload.hasMore);
    setLoading(false);
  };

  useEffect(() => {
    setPage(0);
    fetchCards(0, false);
  }, [filtersKey]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchCards(nextPage, true);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [page, hasMore, loading, filtersKey]);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          className="btn-ghost"
          onClick={() => setDrawerOpen((prev) => !prev)}
        >
          {drawerOpen ? "Close explore" : "Explore"}
        </button>
        <p className="text-xs uppercase tracking-[0.3em] text-dusk">
          {cards.length} cards
        </p>
      </div>

      {drawerOpen ? (
        <div className="section-card space-y-6">
          <div>
            <p className="text-sm font-semibold text-dusk">Card types</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {filterCardTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`tag-chip ${
                    selectedTypes.includes(type)
                      ? "border-ember text-ember"
                      : "text-dusk"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-dusk">Tags</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {filterTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`tag-chip ${
                    selectedTags.includes(tag)
                      ? "border-ember text-ember"
                      : "text-dusk"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-6">
        {cards.map((card) => (
          <div key={card.id} className="fade-in">
            <ConfessionalCard
              text={card.text}
              cardType={card.card_type}
              tags={card.tags}
              day={card.day}
            />
          </div>
        ))}
        {loading ? <p className="text-dusk">Loading...</p> : null}
        {!hasMore && cards.length ? (
          <p className="text-dusk">You&rsquo;ve reached the end of this set.</p>
        ) : null}
        <div ref={sentinelRef} />
      </div>
    </div>
  );
}
