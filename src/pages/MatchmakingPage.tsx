import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { courts } from "../data/courts";
import { Link } from "react-router-dom";

interface PlayerProfile {
  id: string;
  user_id: string;
  display_name: string;
  skill_level: "beginner" | "intermediate" | "advanced";
  preferred_surface: string;
  preferred_time: string;
  looking_for: "partner" | "opponent" | "either";
  bio: string;
  created_at: string;
}

const SKILL_LEVELS = ["beginner", "intermediate", "advanced"] as const;
const SURFACES = ["any", "hard", "clay", "grass"] as const;
const TIMES = ["morning", "afternoon", "evening", "any"] as const;
const LOOKING_FOR = ["partner", "opponent", "either"] as const;

const skillEmoji: Record<string, string> = {
  beginner: "🟢",
  intermediate: "🟡",
  advanced: "🔴",
};

const timeLabels: Record<string, string> = {
  morning: "Morning (7-11 AM)",
  afternoon: "Afternoon (11 AM-3 PM)",
  evening: "Evening (3-8 PM)",
  any: "Any time",
};

function compatibilityScore(a: PlayerProfile, b: PlayerProfile): number {
  let score = 0;

  // Skill level match
  if (a.skill_level === b.skill_level) score += 40;
  else if (
    Math.abs(SKILL_LEVELS.indexOf(a.skill_level) - SKILL_LEVELS.indexOf(b.skill_level)) === 1
  )
    score += 20;

  // Surface match
  if (a.preferred_surface === b.preferred_surface || a.preferred_surface === "any" || b.preferred_surface === "any")
    score += 25;

  // Time match
  if (a.preferred_time === b.preferred_time || a.preferred_time === "any" || b.preferred_time === "any")
    score += 25;

  // Looking for compatibility
  if (a.looking_for === "either" || b.looking_for === "either") score += 10;
  else if (a.looking_for === b.looking_for) score += 10;

  return score;
}

export function MatchmakingPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<PlayerProfile[]>([]);
  const [myProfile, setMyProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [skillLevel, setSkillLevel] = useState<typeof SKILL_LEVELS[number]>("intermediate");
  const [prefSurface, setPrefSurface] = useState<string>("any");
  const [prefTime, setPrefTime] = useState<string>("any");
  const [lookingFor, setLookingFor] = useState<typeof LOOKING_FOR[number]>("either");
  const [bio, setBio] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("player_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    const all = (data ?? []) as PlayerProfile[];
    setProfiles(all);

    if (user) {
      const mine = all.find((p) => p.user_id === user.id) ?? null;
      setMyProfile(mine);
      if (mine) {
        setDisplayName(mine.display_name);
        setSkillLevel(mine.skill_level);
        setPrefSurface(mine.preferred_surface);
        setPrefTime(mine.preferred_time);
        setLookingFor(mine.looking_for);
        setBio(mine.bio);
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !displayName.trim()) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      user_id: user.id,
      display_name: displayName.trim(),
      skill_level: skillLevel,
      preferred_surface: prefSurface,
      preferred_time: prefTime,
      looking_for: lookingFor,
      bio: bio.trim(),
    };

    const { error } = await supabase
      .from("player_profiles")
      .upsert(payload, { onConflict: "user_id" });

    if (error) {
      setError(error.message);
    } else {
      await fetchProfiles();
    }
    setSubmitting(false);
  };

  // AI-matched players (sorted by compatibility)
  const matches = myProfile
    ? profiles
        .filter((p) => p.user_id !== user?.id)
        .map((p) => ({ profile: p, score: compatibilityScore(myProfile, p) }))
        .sort((a, b) => b.score - a.score)
    : [];

  // Suggested court for a match
  function suggestCourt(player: PlayerProfile): string | undefined {
    const surface = player.preferred_surface !== "any" ? player.preferred_surface : myProfile?.preferred_surface;
    if (surface && surface !== "any") {
      const match = courts.find((c) => c.surface === surface);
      if (match) return match.id;
    }
    return courts[0]?.id;
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">🎾</p>
        <p className="text-gray-500 mb-4">Sign in to find tennis partners</p>
        <Link to="/auth" className="text-emerald-600 hover:underline">Sign in</Link>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-16 text-gray-400">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Partner</h1>
      <p className="text-gray-500 mb-6">
        AI matches you with players based on skill level, preferred surface, and schedule
      </p>

      {/* Profile form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {myProfile ? "Update Your Profile" : "Create Your Player Profile"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Your name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value as typeof skillLevel)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {SKILL_LEVELS.map((s) => (
                  <option key={s} value={s}>
                    {skillEmoji[s]} {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Looking For</label>
              <select
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value as typeof lookingFor)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {LOOKING_FOR.map((l) => (
                  <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Surface</label>
              <select
                value={prefSurface}
                onChange={(e) => setPrefSurface(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {SURFACES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
              <select
                value={prefTime}
                onChange={(e) => setPrefTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {TIMES.map((t) => (
                  <option key={t} value={t}>{timeLabels[t]}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio (optional)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              placeholder="Tell others about your playing style..."
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:bg-gray-300 transition-colors"
          >
            {submitting ? "Saving..." : myProfile ? "Update Profile" : "Create Profile"}
          </button>
        </form>
      </div>

      {/* AI Matches */}
      {myProfile && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <span>🤖</span> AI-Matched Players
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Ranked by compatibility with your profile
          </p>

          {matches.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-4">👥</p>
              <p>No other players yet — share the app to find partners!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map(({ profile, score }) => {
                const courtId = suggestCourt(profile);
                return (
                  <div
                    key={profile.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-lg font-bold text-emerald-700 shrink-0">
                      {profile.display_name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{profile.display_name}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                          {score}% match
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        <span className="text-xs text-gray-500">
                          {skillEmoji[profile.skill_level]} {profile.skill_level}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 capitalize">
                          {profile.preferred_surface} surface
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 capitalize">
                          {profile.preferred_time}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 capitalize">
                          Looking for {profile.looking_for}
                        </span>
                      </div>
                      {profile.bio && (
                        <p className="text-sm text-gray-500 mt-1.5">{profile.bio}</p>
                      )}
                    </div>
                    {courtId && (
                      <Link
                        to={`/court/${courtId}`}
                        className="shrink-0 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-colors"
                      >
                        Book together
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
