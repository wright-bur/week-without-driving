"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { filterCardTypes, moderationTags } from "@/lib/constants";

type PendingCard = {
  id: string;
  text: string;
  card_type: string | null;
  tags: string[];
  flagged: boolean;
  flag_reason: string | null;
  day: number | null;
  created_at: string;
};

type Stats = {
  participantsStarted: number;
  completed: number;
  pendingCards: number;
  approvedCards: number;
};

export default function AdminClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingCard[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const setup = async () => {
      const supabaseBrowser = getSupabaseBrowserClient();
      const { data } = await supabaseBrowser.auth.getSession();
      if (data.session?.access_token) {
        setSessionToken(data.session.access_token);
      }
    };
    setup();

    const supabaseBrowser = getSupabaseBrowserClient();
    const {
      data: { subscription }
    } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setSessionToken(session?.access_token ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAdminData = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const [pendingRes, statsRes] = await Promise.all([
        fetch("/api/admin/pending", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      if (!pendingRes.ok || !statsRes.ok) {
        throw new Error("Unable to load admin data.");
      }
      const pendingData = (await pendingRes.json()) as PendingCard[];
      const statsData = (await statsRes.json()) as Stats;
      setPending(pendingData);
      setStats(statsData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionToken) {
      fetchAdminData(sessionToken);
    }
  }, [sessionToken]);

  const handleLogin = async () => {
    setError(null);
    setInfo(null);
    try {
      const supabaseBrowser = getSupabaseBrowserClient();
      const { error: signInError } =
        await supabaseBrowser.auth.signInWithPassword({
          email,
          password
        });
      if (signInError) throw signInError;
      setInfo("Signed in.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to sign in";
      setError(message);
    }
  };

  const handleMagicLink = async () => {
    setError(null);
    setInfo(null);
    try {
      const supabaseBrowser = getSupabaseBrowserClient();
      const { error: signInError } = await supabaseBrowser.auth.signInWithOtp({
        email
      });
      if (signInError) throw signInError;
      setInfo("Magic link sent. Check your inbox.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to send link";
      setError(message);
    }
  };

  const updateCard = async (card: PendingCard, status: string) => {
    if (!sessionToken) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/card", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          id: card.id,
          text: card.text,
          card_type: card.card_type,
          tags: card.tags,
          status
        })
      });
      if (!response.ok) {
        throw new Error("Unable to update card.");
      }
      await fetchAdminData(sessionToken);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!sessionToken) {
    return (
      <div className="section-card space-y-4">
        <h2 className="font-serif text-2xl">Moderator login</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-dusk">Email</label>
            <input
              className="input-base mt-2"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="moderator@email.com"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-dusk">Password</label>
            <input
              className="input-base mt-2"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary" onClick={handleLogin}>
              Sign in
            </button>
            <button className="btn-secondary" onClick={handleMagicLink}>
              Send magic link
            </button>
          </div>
          {error ? <p className="text-sm text-ember">{error}</p> : null}
          {info ? <p className="text-sm text-dusk">{info}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {stats ? (
        <section className="section-card grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-dusk">
              Analytics
            </p>
            <h2 className="font-serif text-2xl">At a glance</h2>
          </div>
          <div className="space-y-2 text-lg text-ink/80">
            <p>Participants started: {stats.participantsStarted}</p>
            <p>Completed weeks: {stats.completed}</p>
            <p>Pending cards: {stats.pendingCards}</p>
            <p>Approved cards: {stats.approvedCards}</p>
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="font-serif text-2xl">Pending cards</h2>
        {loading ? <p className="text-dusk">Loading...</p> : null}
        {pending.length === 0 ? (
          <p className="text-dusk">No pending cards right now.</p>
        ) : null}
        <div className="space-y-6">
          {pending.map((card) => (
            <div key={card.id} className="section-card space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs uppercase tracking-[0.3em] text-dusk">
                  Day {card.day ?? "?"}
                </p>
                {card.flagged ? (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-ember">
                    Flagged: {card.flag_reason}
                  </span>
                ) : null}
              </div>
              <textarea
                className="input-base min-h-[120px]"
                value={card.text}
                onChange={(event) =>
                  setPending((prev) =>
                    prev.map((item) =>
                      item.id === card.id
                        ? { ...item, text: event.target.value }
                        : item
                    )
                  )
                }
              />
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-dusk">
                    Card type
                  </label>
                  <select
                    className="input-base mt-2"
                    value={card.card_type ?? ""}
                    onChange={(event) =>
                      setPending((prev) =>
                        prev.map((item) =>
                          item.id === card.id
                            ? { ...item, card_type: event.target.value }
                            : item
                        )
                      )
                    }
                  >
                    <option value="">Select type</option>
                    {filterCardTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-dusk">
                    Tags
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {moderationTags.map((tag) => (
                      <button
                        key={tag}
                        className={`tag-chip ${
                          card.tags.includes(tag)
                            ? "border-ember text-ember"
                            : "text-dusk"
                        }`}
                        onClick={() =>
                          setPending((prev) =>
                            prev.map((item) =>
                              item.id === card.id
                                ? {
                                    ...item,
                                    tags: item.tags.includes(tag)
                                      ? item.tags.filter((t) => t !== tag)
                                      : [...item.tags, tag]
                                  }
                                : item
                            )
                          )
                        }
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  className="btn-primary"
                  onClick={() => updateCard(card, "approved")}
                >
                  Approve
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => updateCard(card, "rejected")}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      {error ? <p className="text-ember">{error}</p> : null}
    </div>
  );
}
