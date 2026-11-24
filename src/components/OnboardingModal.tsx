"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Compass,
  HeartPulse,
  Lock,
  MapPin,
  Search,
  Sparkles,
  Users,
  Wind,
  X,
} from "lucide-react";
import { DEMO_HOUSEHOLD_PROFILE, PRESET_LOCATIONS } from "@/lib/fixtures";
import type {
  BudgetTier,
  CommuteMode,
  CookingFuel,
  UserLocation,
  UserProfile,
} from "@/lib/types";
import { cn } from "@/lib/cn";
import { Button } from "./ui/primitives";

interface GeoResult {
  id: number;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export function OnboardingModal({
  open,
  initialProfile,
  onComplete,
  onSkip,
  onLoadDemo,
}: {
  open: boolean;
  initialProfile: UserProfile;
  onComplete: (profile: UserProfile) => void;
  onSkip: () => void;
  onLoadDemo: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [draft, setDraft] = useState<UserProfile>(initialProfile);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const [searchError, setSearchError] = useState<string | null>(null);

  // Open-Meteo Geocoding search-as-you-type with AbortController
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError(null);
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            trimmed
          )}&count=5&language=en&format=json`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = (await res.json()) as { results?: GeoResult[] };
          setResults(data.results ?? []);
          if (!data.results || data.results.length === 0) {
            setSearchError("No matching cities found. Try another spelling or quick city below.");
          }
        } else {
          setSearchError("City search is temporarily unavailable. Pick a quick city below.");
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setResults([]);
        setSearchError("Offline or network blocked. Pick a quick city below.");
      } finally {
        setSearching(false);
      }
    }, 260);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  if (!open) return null;

  const visibleResults = query.trim().length < 2 ? [] : results;

  const handleUseMyLocation = () => {
    setGeoError(null);
    if (!("geolocation" in navigator)) {
      setGeoError("Location access is unavailable in this browser. Pick a city below.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = Number(pos.coords.latitude.toFixed(3));
        const longitude = Number(pos.coords.longitude.toFixed(3));
        let name = `My Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;
        let region = "";
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          if (res.ok) {
            const info = (await res.json()) as { city?: string; locality?: string; principalSubdivision?: string };
            if (info.city || info.locality) {
              name = info.city || info.locality || name;
              region = info.principalSubdivision || "";
            }
          }
        } catch {
          // Keep coordinate label if reverse lookup is unavailable
        }
        setDraft((prev) => ({
          ...prev,
          location: {
            name,
            region,
            country: "India",
            latitude,
            longitude,
          },
        }));
        setLocating(false);
      },
      () => {
        setLocating(false);
        setGeoError("Could not read GPS location. Search your city or pick a quick city.");
      },
      { timeout: 6000 }
    );
  };

  const selectLocation = (loc: UserLocation) => {
    setDraft((prev) => ({ ...prev, location: loc }));
    setQuery("");
    setResults([]);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-0 sm:p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        className="w-full max-w-lg max-h-[92dvh] overflow-y-auto bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-t-[24px] sm:rounded-[24px] shadow-2xl p-5 sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--aqi-accent)]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Step {step} of 3 · Under 30 sec
            </span>
            <h2 id="onboarding-title" className="text-xl font-bold mt-1">
              {step === 1 && "Where are you breathing today?"}
              {step === 2 && "Who is in your household?"}
              {step === 3 && "Your home & daily commute"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onSkip}
            aria-label="Skip setup"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-muted)] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step progress bars */}
        <div className="grid grid-cols-3 gap-2 my-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "h-1.5 rounded-full transition-colors",
                s <= step ? "bg-[var(--aqi-accent)]" : "bg-[var(--bg-muted)]"
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="space-y-4"
            >
              <div className="relative">
                <Search
                  className="h-4 w-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search city or neighbourhood (e.g. Delhi, Pune)..."
                  aria-label="Search city"
                  className="w-full min-h-[46px] pl-10 pr-4 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                />
              </div>

              {searching && (
                <p className="text-xs text-[var(--text-muted)]">Searching Open-Meteo cities...</p>
              )}

              {!searching && searchError && query.trim().length >= 2 && (
                <p className="text-xs text-amber-700 dark:text-amber-300">{searchError}</p>
              )}

              {visibleResults.length > 0 && (
                <ul className="divide-y divide-[var(--border-subtle)] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] overflow-hidden">
                  {visibleResults.map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() =>
                          selectLocation({
                            name: r.name,
                            region: r.admin1 ?? "",
                            country: r.country ?? "",
                            latitude: r.latitude,
                            longitude: r.longitude,
                          })
                        }
                        className="w-full min-h-[44px] px-4 py-2.5 text-left text-sm hover:bg-[var(--bg-muted)] flex items-center justify-between cursor-pointer"
                      >
                        <span className="font-medium">{r.name}</span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {[r.admin1, r.country].filter(Boolean).join(", ")}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUseMyLocation}
                  disabled={locating}
                >
                  <Compass className="h-4 w-4" />
                  {locating ? "Locating..." : "Use my location"}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    onLoadDemo();
                  }}
                >
                  <Users className="h-4 w-4" />
                  One-tap Demo Family ({DEMO_HOUSEHOLD_PROFILE.location.name.split(" ")[0]})
                </Button>
              </div>

              {geoError && (
                <p className="text-xs text-amber-600 dark:text-amber-300">{geoError}</p>
              )}

              <div>
                <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Quick cities</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_LOCATIONS.map((loc) => {
                    const active = draft.location.name === loc.name;
                    return (
                      <button
                        key={loc.name}
                        type="button"
                        onClick={() => selectLocation(loc)}
                        className={cn(
                          "min-h-[44px] px-3.5 rounded-full text-sm font-medium border transition-all inline-flex items-center gap-1.5 cursor-pointer",
                          active
                            ? "bg-[var(--aqi-accent-soft)] border-[var(--aqi-accent)] text-[var(--aqi-badge-text)]"
                            : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]"
                        )}
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        {loc.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-3 text-sm flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Selected:</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {draft.location.name}
                  {draft.location.region ? `, ${draft.location.region}` : ""}
                </span>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "adults" as const, label: "Adults", min: 1 },
                  { key: "children" as const, label: "Children", min: 0 },
                  { key: "elderly" as const, label: "Elderly 60+", min: 0 },
                ].map((item) => {
                  const val = draft.household[item.key];
                  return (
                    <div
                      key={item.key}
                      className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 text-center"
                    >
                      <p className="text-xs font-medium text-[var(--text-muted)]">{item.label}</p>
                      <p className="text-2xl font-bold tabular-nums my-1">{val}</p>
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          aria-label={`Decrease ${item.label}`}
                          onClick={() =>
                            setDraft((p) => ({
                              ...p,
                              household: {
                                ...p.household,
                                [item.key]: Math.max(item.min, val - 1),
                              },
                            }))
                          }
                          className="h-9 w-9 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          aria-label={`Increase ${item.label}`}
                          onClick={() =>
                            setDraft((p) => ({
                              ...p,
                              household: {
                                ...p.household,
                                [item.key]: Math.min(8, val + 1),
                              },
                            }))
                          }
                          className="h-9 w-9 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-[var(--text-muted)]">
                  Sensitive health considerations
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((p) => ({
                        ...p,
                        household: {
                          ...p.household,
                          asthmaOrRespiratory: !p.household.asthmaOrRespiratory,
                        },
                      }))
                    }
                    className={cn(
                      "min-h-[44px] px-4 rounded-2xl border text-sm font-medium inline-flex items-center gap-2 cursor-pointer transition-colors",
                      draft.household.asthmaOrRespiratory
                        ? "bg-[var(--aqi-accent-soft)] border-[var(--aqi-accent)] text-[var(--aqi-badge-text)]"
                        : "bg-[var(--bg-canvas)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
                    )}
                  >
                    <Wind className="h-4 w-4" />
                    Asthma / Respiratory sensitivity
                    {draft.household.asthmaOrRespiratory && <Check className="h-4 w-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setDraft((p) => ({
                        ...p,
                        household: {
                          ...p.household,
                          heartCondition: !p.household.heartCondition,
                        },
                      }))
                    }
                    className={cn(
                      "min-h-[44px] px-4 rounded-2xl border text-sm font-medium inline-flex items-center gap-2 cursor-pointer transition-colors",
                      draft.household.heartCondition
                        ? "bg-[var(--aqi-accent-soft)] border-[var(--aqi-accent)] text-[var(--aqi-badge-text)]"
                        : "bg-[var(--bg-canvas)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
                    )}
                  >
                    <HeartPulse className="h-4 w-4" />
                    Heart / BP condition
                    {draft.household.heartCondition && <Check className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="space-y-4"
            >
              <div>
                <p className="text-xs font-medium text-[var(--text-muted)] mb-1.5">Primary commute</p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["walk", "Walk"],
                      ["cycle", "Cycle"],
                      ["two_wheeler", "Two-wheeler"],
                      ["car", "Car"],
                      ["metro_bus", "Metro / Bus"],
                    ] as Array<[CommuteMode, string]>
                  ).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() =>
                        setDraft((p) => ({ ...p, lifestyle: { ...p.lifestyle, commute: val } }))
                      }
                      className={cn(
                        "min-h-[44px] px-3.5 rounded-full text-sm font-medium border cursor-pointer",
                        draft.lifestyle.commute === val
                          ? "bg-[var(--aqi-accent-soft)] border-[var(--aqi-accent)] text-[var(--aqi-badge-text)]"
                          : "bg-[var(--bg-canvas)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setDraft((p) => ({
                      ...p,
                      lifestyle: { ...p.lifestyle, hasPurifier: !p.lifestyle.hasPurifier },
                    }))
                  }
                  className={cn(
                    "min-h-[44px] px-3.5 rounded-2xl border text-sm font-medium text-left flex items-center justify-between cursor-pointer",
                    draft.lifestyle.hasPurifier
                      ? "bg-[var(--aqi-accent-soft)] border-[var(--aqi-accent)] text-[var(--aqi-badge-text)]"
                      : "bg-[var(--bg-canvas)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
                  )}
                >
                  <span>Have air purifier</span>
                  <span>{draft.lifestyle.hasPurifier ? "Yes" : "No"}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setDraft((p) => ({
                      ...p,
                      lifestyle: { ...p.lifestyle, leakyWindows: !p.lifestyle.leakyWindows },
                    }))
                  }
                  className={cn(
                    "min-h-[44px] px-3.5 rounded-2xl border text-sm font-medium text-left flex items-center justify-between cursor-pointer",
                    draft.lifestyle.leakyWindows
                      ? "bg-[var(--aqi-accent-soft)] border-[var(--aqi-accent)] text-[var(--aqi-badge-text)]"
                      : "bg-[var(--bg-canvas)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
                  )}
                >
                  <span>Window / door drafts</span>
                  <span>{draft.lifestyle.leakyWindows ? "Yes" : "Sealed"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-[var(--text-muted)] mb-1.5">Cooking fuel</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        ["lpg", "LPG"],
                        ["induction", "Induction"],
                        ["biomass", "Biomass"],
                      ] as Array<[CookingFuel, string]>
                    ).map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() =>
                          setDraft((p) => ({
                            ...p,
                            lifestyle: { ...p.lifestyle, cookingFuel: val },
                          }))
                        }
                        className={cn(
                          "min-h-[44px] px-3 rounded-full text-xs font-semibold border cursor-pointer",
                          draft.lifestyle.cookingFuel === val
                            ? "bg-[var(--aqi-accent-soft)] border-[var(--aqi-accent)] text-[var(--aqi-badge-text)]"
                            : "bg-[var(--bg-canvas)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-[var(--text-muted)] mb-1.5">Action budget</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        ["free", "Free"],
                        ["low", "Low cost"],
                        ["flexible", "Flexible"],
                      ] as Array<[BudgetTier, string]>
                    ).map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() =>
                          setDraft((p) => ({ ...p, lifestyle: { ...p.lifestyle, budget: val } }))
                        }
                        className={cn(
                          "min-h-[44px] px-3 rounded-full text-xs font-semibold border cursor-pointer",
                          draft.lifestyle.budget === val
                            ? "bg-[var(--aqi-accent-soft)] border-[var(--aqi-accent)] text-[var(--aqi-badge-text)]"
                            : "bg-[var(--bg-canvas)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-3 flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                <Lock className="h-4 w-4 shrink-0 text-[var(--aqi-accent)] mt-0.5" aria-hidden="true" />
                <span>
                  Privacy promise: your location & household profile are stored in{" "}
                  <strong>localStorage only</strong> on this device and never saved in any database.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-between gap-3">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep((s) => (s === 3 ? 2 : 1))}>
              Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={onSkip}>
              Skip for now
            </Button>
          )}

          {step < 3 ? (
            <Button onClick={() => setStep((s) => (s === 1 ? 2 : 3))}>Continue</Button>
          ) : (
            <Button
              onClick={() =>
                onComplete({
                  ...draft,
                  onboarded: true,
                  isDemoProfile: false,
                })
              }
            >
              Build My Plan
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
