"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { areaTypeOptions, parentStatusOptions } from "@/lib/constants";

export default function StartClient() {
  const router = useRouter();
  const [parentStatus, setParentStatus] = useState("Prefer not to say");
  const [areaType, setAreaType] = useState("Prefer not to say");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setError(null);
    setLoading(true);
    try {
      const supabaseBrowser = getSupabaseBrowserClient();
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      let session = sessionData.session;

      if (!session) {
        const { data, error: signInError } =
          await supabaseBrowser.auth.signInAnonymously();
        if (signInError) throw signInError;
        session = data.session ?? null;
      }

      if (!session?.access_token) {
        throw new Error("Unable to create an anonymous session.");
      }

      const response = await fetch("/api/participants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          parent_status: parentStatus,
          area_type: areaType
        })
      });

      if (!response.ok) {
        throw new Error("Failed to start your week.");
      }

      router.push("/day/1");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
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
