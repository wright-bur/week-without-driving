"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ensureAccessToken } from "@/lib/supabase/session";
import { areaTypeOptions, parentStatusOptions } from "@/lib/constants";

export default function StartClient() {
  const router = useRouter();
  const [parentStatus, setParentStatus] = useState("Prefer not to say");
  const [areaType, setAreaType] = useState("Prefer not to say");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withTimeout = async <T,>(promise: Promise<T>, ms: number, message: string) => {
    let timeoutId: number | null = null;
    const timeout = new Promise<T>((_resolve, reject) => {
      timeoutId = window.setTimeout(() => {
        reject(new Error(message));
      }, ms);
    });

    try {
      return await Promise.race([promise, timeout]);
    } finally {
      if (timeoutId) window.clearTimeout(timeoutId);
    }
  };

  const handleStart = async () => {
    setError(null);
    setLoading(true);
    try {
      const accessToken = await withTimeout(
        ensureAccessToken(),
        8000,
        "Anonymous sign-in timed out. Please try again."
      );

      if (!accessToken) {
        throw new Error("Unable to create an anonymous session.");
      }

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 12000);
      const response = await fetch("/api/participants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          parent_status: parentStatus,
          area_type: areaType
        }),
        signal: controller.signal
      });
      window.clearTimeout(timeoutId);

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message =
          payload?.error ??
          "Failed to start your week. Please check your connection and try again.";
        throw new Error(message);
      }

      router.push("/day/1");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("This is taking longer than expected. Please try again.");
      } else {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="section-card space-y-4">
        <div>
          <label className="text-sm font-semibold text-dusk">Parent status</label>
          <select
            className="input-base mt-2"
            value={parentStatus}
            onChange={(event) => setParentStatus(event.target.value)}
          >
            {parentStatusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-dusk">Area type</label>
          <select
            className="input-base mt-2"
            value={areaType}
            onChange={(event) => setAreaType(event.target.value)}
          >
            {areaTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          className="btn-primary"
          onClick={handleStart}
          disabled={loading}
        >
          {loading ? "Starting..." : "Begin Day 1"}
        </button>
        {error ? <p className="text-sm text-ember">{error}</p> : null}
      </div>
    </div>
  );
}
