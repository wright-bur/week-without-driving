"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ensureAccessToken } from "@/lib/supabase/session";
import {
  almostBrokeOptions,
  surpriseOptions,
  tripModeOptions,
  tripTypeOptions
} from "@/lib/constants";
import type { DailyEntryInput, TripMode, TripType } from "@/types";

const defaultEntry: DailyEntryInput = {
  day: 1,
  trip_type: null,
  trip_mode: [],
  almost_broke_tags: [],
  almost_broke_text: null,
  surprise: null,
  publish_ok: false,
  skipped: false
};

function toggleArrayValue<T>(arr: T[], value: T) {
  return arr.includes(value)
    ? arr.filter((item) => item !== value)
    : [...arr, value];
}

export default function DayClient({ initialDay }: { initialDay: number }) {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState(initialDay);
  const storageKey = useMemo(
    () => `wwd-day-${selectedDay}`,
    [selectedDay]
  );
  const [entry, setEntry] = useState<DailyEntryInput>({
    ...defaultEntry,
    day: selectedDay
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as DailyEntryInput;
        setEntry({ ...defaultEntry, ...parsed, day: selectedDay });
      } catch {
        setEntry({ ...defaultEntry, day: selectedDay });
      }
    } else {
      setEntry({ ...defaultEntry, day: selectedDay });
    }
    setSaved(false);
    setError(null);
  }, [selectedDay, storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(entry));
  }, [entry, storageKey]);

  const handleSubmit = async (skipped: boolean) => {
    setError(null);
    setSaved(false);
    if (!skipped) {
      if (!entry.trip_type || !entry.surprise) {
        setError("Please answer the trip and surprise prompts.");
        return;
      }
      if (
        entry.trip_type !== "I didn't replace one" &&
        entry.trip_mode.length === 0
      ) {
        setError("Please select at least one replacement mode.");
        return;
      }
    }

    setSaving(true);
    try {
      const accessToken = await ensureAccessToken();
      if (!accessToken) {
        throw new Error("Missing session.");
      }

      const payload: DailyEntryInput = skipped
        ? { ...defaultEntry, day: selectedDay, skipped: true, publish_ok: false }
        : { ...entry, day: selectedDay, skipped: false };

      const response = await fetch("/api/day", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error ?? "Unable to save today.");
      }

      localStorage.removeItem(storageKey);
      setSaved(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="section-card space-y-4">
        <label className="text-sm font-semibold text-dusk">
          Which day are you reflecting on?
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="input-base max-w-[160px]"
            value={selectedDay}
            onChange={(event) => {
              const nextDay = Number(event.target.value);
              if (Number.isInteger(nextDay)) {
                setSelectedDay(nextDay);
                router.replace(`/day/${nextDay}`);
              }
            }}
          >
            {Array.from({ length: 7 }).map((_, index) => (
              <option key={index + 1} value={index + 1}>
                Day {index + 1}
              </option>
            ))}
          </select>
          <p className="text-sm text-dusk">
            You can log any day in any order.
          </p>
        </div>
      </section>
      <section className="section-card space-y-4">
        <h2 className="font-serif text-2xl">
          What trip did you replace on this day?
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {tripTypeOptions.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-amber-200/60 bg-white/70 p-3 text-sm font-medium text-ink"
            >
              <input
                type="radio"
                name="trip_type"
                value={option}
                checked={entry.trip_type === option}
                onChange={() =>
                  setEntry((prev) => ({
                    ...prev,
                    trip_type: option as TripType
                  }))
                }
              />
              {option}
            </label>
          ))}
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-dusk">
            What did you use instead?
          </p>
          <div className="flex flex-wrap gap-2">
            {tripModeOptions.map((option) => {
              const isSelected = entry.trip_mode.includes(option);
              return (
                <button
                  type="button"
                  key={option}
                  role="checkbox"
                  aria-checked={isSelected}
                  className={`tag-chip cursor-pointer select-none ${
                    isSelected ? "border-ember text-ember" : "text-dusk"
                  }`}
                  onClick={() =>
                    setEntry((prev) => ({
                      ...prev,
                      trip_mode: toggleArrayValue(
                        prev.trip_mode,
                        option as TripMode
                      )
                    }))
                  }
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-card space-y-4">
        <h2 className="font-serif text-2xl">What almost broke you?</h2>
        <div className="flex flex-wrap gap-2">
          {almostBrokeOptions.map((option) => {
            const isSelected = entry.almost_broke_tags.includes(option);
            return (
              <button
                type="button"
                key={option}
                role="checkbox"
                aria-checked={isSelected}
                className={`tag-chip cursor-pointer select-none ${
                  isSelected ? "border-ember text-ember" : "text-dusk"
                }`}
                onClick={() =>
                  setEntry((prev) => ({
                    ...prev,
                    almost_broke_tags: toggleArrayValue(
                      prev.almost_broke_tags,
                      option
                    )
                  }))
                }
              >
                {option}
              </button>
            );
          })}
        </div>
        <div>
          <label className="text-sm font-semibold text-dusk">
            One sentence (no names, no locations):
          </label>
          <textarea
            className="input-base mt-2 min-h-[110px]"
            maxLength={160}
            value={entry.almost_broke_text ?? ""}
            onChange={(event) =>
              setEntry((prev) => ({
                ...prev,
                almost_broke_text: event.target.value || null
              }))
            }
            placeholder="One sentence (no names, no locations): ..."
          />
          <p className="mt-2 text-xs text-dusk">
            {entry.almost_broke_text?.length ?? 0}/160 characters
          </p>
        </div>
      </section>

      <section className="section-card space-y-4">
        <h2 className="font-serif text-2xl">What surprised you?</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {surpriseOptions.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-amber-200/60 bg-white/70 p-3 text-sm font-medium text-ink"
            >
              <input
                type="radio"
                name="surprise"
                value={option}
                checked={entry.surprise === option}
                onChange={() =>
                  setEntry((prev) => ({
                    ...prev,
                    surprise: option
                  }))
                }
              />
              {option}
            </label>
          ))}
        </div>
      </section>

      <section className="section-card space-y-4">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="font-serif text-2xl">Publish permission</h2>
            <p className="text-sm text-dusk">
              It&rsquo;s okay to publish an anonymized 1-3 line card from this day
              to the public scroll.
            </p>
          </div>
          <label className="flex items-center gap-3 text-sm font-semibold text-ink">
            <input
              type="checkbox"
              checked={entry.publish_ok}
              onChange={(event) =>
                setEntry((prev) => ({
                  ...prev,
                  publish_ok: event.target.checked
                }))
              }
            />
            Allow
          </label>
        </div>
        {entry.publish_ok ? (
          <p className="rounded-2xl border border-amber-200/70 bg-amber-50 px-4 py-3 text-sm text-ember">
            No names, streets, schools, employers, or specific places.
          </p>
        ) : null}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          className="btn-primary"
          onClick={() => handleSubmit(false)}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save entry"}
        </button>
        <button
          className="btn-secondary"
          onClick={() => handleSubmit(true)}
          disabled={saving}
        >
          Mark day skipped
        </button>
        {saved ? (
          <p className="text-sm text-dusk">Saved for Day {selectedDay}.</p>
        ) : null}
        {error ? <p className="text-sm text-ember">{error}</p> : null}
      </div>
    </div>
  );
}
