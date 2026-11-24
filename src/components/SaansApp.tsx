"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Home,
  Languages,
  ListChecks,
  MessageCircle,
  RefreshCw,
  Share2,
  ShieldAlert,
  Sparkles,
  User,
  WifiOff,
} from "lucide-react";
import { buildGroupAdvisories, getUsBandKey } from "@/lib/aqi";
import { DEFAULT_PROFILE, DEMO_HOUSEHOLD_PROFILE } from "@/lib/fixtures";
import { getCopy } from "@/lib/i18n";
import {
  AirQualityReportSchema,
  PlanResponseSchema,
  type AirQualityReport,
  type AqiScale,
  type Language,
  type PlanAction,
  type PlanResponse,
  type UserProfile,
  UserProfileSchema,
} from "@/lib/types";
import { cn } from "@/lib/cn";
import { AskSaansChat } from "./AskSaansChat";
import { CommunityBrief } from "./CommunityBrief";
import { ForecastChart } from "./ForecastChart";
import { HeroAqiCard } from "./HeroAqiCard";
import { ImpactExplainerModal } from "./ImpactExplainerModal";
import { OnboardingModal } from "./OnboardingModal";
import { PlanSection } from "./PlanSection";
import { PollutantGrid } from "./PollutantGrid";
import { ProfileControls } from "./ProfileControls";
import { ToastBanner, type ToastMessage } from "./ui/Toast";
import { Badge, Button, Card, Skeleton } from "./ui/primitives";

type TabId = "home" | "plan" | "ask" | "community" | "profile";

const PROFILE_STORAGE_KEY = "saans_profile_v1";
const COMPLETED_STORAGE_KEY = "saans_completed_v1";
const LAST_AIR_STORAGE_KEY = "saans_last_air_v1";
const LAST_PLAN_STORAGE_KEY = "saans_last_plan_v1";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function SaansApp() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [hydrated, setHydrated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [simulateSmog, setSimulateSmog] = useState(false);

  const [air, setAir] = useState<AirQualityReport | null>(null);
  const [airLoading, setAirLoading] = useState(true);
  const [airError, setAirError] = useState<string | null>(null);

  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [inspectedAction, setInspectedAction] = useState<PlanAction | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const notify = useCallback((text: string, tone: "info" | "success" = "info") => {
    setToast({ id: Date.now(), text, tone });
  }, []);

  const airAbortRef = useRef<AbortController | null>(null);
  const planAbortRef = useRef<AbortController | null>(null);
  const profileRef = useRef<UserProfile>(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  // Hydrate profile, cached offline snapshots & check-offs from localStorage + register PWA service worker
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (raw) {
          const parsed = UserProfileSchema.safeParse(JSON.parse(raw));
          if (parsed.success) {
            setProfile(parsed.data);
            setShowOnboarding(!parsed.data.onboarded);
          } else {
            setShowOnboarding(true);
          }
        } else {
          setShowOnboarding(true);
        }

        const rawDone = localStorage.getItem(COMPLETED_STORAGE_KEY);
        if (rawDone) {
          const parsedDone = JSON.parse(rawDone) as { date?: string; ids?: string[] };
          if (parsedDone.date === todayKey() && Array.isArray(parsedDone.ids)) {
            setCompletedIds(parsedDone.ids);
          }
        }

        const rawAir = localStorage.getItem(LAST_AIR_STORAGE_KEY);
        if (rawAir) {
          const parsedAir = AirQualityReportSchema.safeParse(JSON.parse(rawAir));
          if (parsedAir.success) {
            setAir(parsedAir.data);
            setAirLoading(false);
          }
        }

        const rawPlan = localStorage.getItem(LAST_PLAN_STORAGE_KEY);
        if (rawPlan) {
          const parsedPlan = PlanResponseSchema.safeParse(JSON.parse(rawPlan));
          if (parsedPlan.success) {
            setPlan(parsedPlan.data);
          }
        }
      } catch {
        setShowOnboarding(true);
      } finally {
        setHydrated(true);
      }
      setIsOffline(!navigator.onLine);
    });

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    return () => {
      active = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const persistProfile = useCallback((next: UserProfile) => {
    setProfile(next);
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  }, []);

  const toggleCompleted = useCallback((id: string) => {
    setCompletedIds((prev) => {
      const adding = !prev.includes(id);
      const next = adding ? [...prev, id] : prev.filter((x) => x !== id);
      try {
        localStorage.setItem(
          COMPLETED_STORAGE_KEY,
          JSON.stringify({ date: todayKey(), ids: next })
        );
      } catch {
        // Ignore
      }
      if (adding) {
        notify("Action marked done — protected air tally updated", "success");
      }
      return next;
    });
  }, [notify]);

  const fetchAir = useCallback(async (targetProfile: UserProfile, sim: boolean) => {
    airAbortRef.current?.abort();
    const controller = new AbortController();
    airAbortRef.current = controller;

    setAirLoading(true);
    setAirError(null);
    try {
      const qs = new URLSearchParams({
        lat: String(targetProfile.location.latitude),
        lon: String(targetProfile.location.longitude),
        city: targetProfile.location.name,
        region: targetProfile.location.region ?? "",
        country: targetProfile.location.country ?? "India",
        simulate: sim ? "smog" : "false",
      });
      const res = await fetch(`/api/air?${qs.toString()}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Could not load air quality data.");
      const data = AirQualityReportSchema.parse(await res.json());
      setAir(data);
      setPlan(null);
      try {
        localStorage.setItem(LAST_AIR_STORAGE_KEY, JSON.stringify(data));
      } catch {
        // Ignore storage quota errors
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setAirError(err instanceof Error ? err.message : "Failed to load air quality.");
    } finally {
      if (airAbortRef.current === controller) {
        setAirLoading(false);
      }
    }
  }, []);

  const fetchPlan = useCallback(
    async (targetProfile: UserProfile, targetAir: AirQualityReport) => {
      planAbortRef.current?.abort();
      const controller = new AbortController();
      planAbortRef.current = controller;

      setPlanLoading(true);
      setPlanError(null);
      try {
        const res = await fetch("/api/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: targetProfile, air: targetAir }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Could not build today's plan.");
        const data = PlanResponseSchema.parse(await res.json());
        setPlan(data);
        try {
          localStorage.setItem(LAST_PLAN_STORAGE_KEY, JSON.stringify(data));
        } catch {
          // Ignore storage quota errors
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setPlanError(err instanceof Error ? err.message : "Failed to generate plan.");
      } finally {
        if (planAbortRef.current === controller) {
          setPlanLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      void fetchAir(profileRef.current, simulateSmog);
    }, 0);
    return () => {
      clearTimeout(timer);
      airAbortRef.current?.abort();
    };
  }, [
    hydrated,
    profile.location.latitude,
    profile.location.longitude,
    profile.location.name,
    profile.location.region,
    profile.location.country,
    simulateSmog,
    fetchAir,
  ]);

  useEffect(() => {
    if (!hydrated || !air) return;
    const timer = setTimeout(() => {
      void fetchPlan(profileRef.current, air);
    }, 0);
    return () => {
      clearTimeout(timer);
      planAbortRef.current?.abort();
    };
  }, [
    hydrated,
    air,
    profile.household.adults,
    profile.household.children,
    profile.household.elderly,
    profile.household.asthmaOrRespiratory,
    profile.household.heartCondition,
    profile.lifestyle.commute,
    profile.lifestyle.hasPurifier,
    profile.lifestyle.leakyWindows,
    profile.lifestyle.cookingFuel,
    profile.lifestyle.budget,
    profile.language,
    fetchPlan,
  ]);

  // Apply adaptive AQI theme band globally
  const activeBandKey = useMemo(() => {
    if (!air) return "moderate";
    return profile.aqiScale === "cpcb" ? air.bandKey : getUsBandKey(air.usAqi);
  }, [air, profile.aqiScale]);

  useEffect(() => {
    document.documentElement.setAttribute("data-aqi-band", activeBandKey);
  }, [activeBandKey]);

  const t = getCopy(profile.language);
  const advisories = useMemo(
    () => (air ? buildGroupAdvisories(air.cpcbAqi, profile) : []),
    [air, profile]
  );

  const completedCount = plan
    ? plan.actions.filter((a) => completedIds.includes(a.id)).length
    : 0;
  const totalPm25Protected = plan
    ? plan.actions
        .filter((a) => completedIds.includes(a.id))
        .reduce((sum, a) => sum + a.impact.pm25DeltaUgM3, 0)
    : 0;

  const handleLoadDemo = () => {
    const next: UserProfile = {
      ...DEMO_HOUSEHOLD_PROFILE,
      language: profile.language,
      aqiScale: profile.aqiScale,
    };
    persistProfile(next);
    setShowOnboarding(false);
    notify("Demo family loaded (New Delhi · Rohini)", "success");
  };

  const handleScaleChange = (scale: AqiScale) => {
    persistProfile({ ...profile, aqiScale: scale });
    notify(`Switched scale to ${scale === "cpcb" ? "India CPCB" : "US EPA AQI"}`);
  };

  const handleLanguageChange = (lang: Language) => {
    persistProfile({ ...profile, language: lang });
    notify(lang === "hi" ? "भाषा हिन्दी में बदली गई" : "Language set to English");
  };

  const handleSimulatorToggle = (next: boolean) => {
    setSimulateSmog(next);
    notify(
      next
        ? "Winter Smog Simulator enabled (AQI ~312)"
        : "Switched back to live local air data"
    );
  };

  const handleReset = () => {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    localStorage.removeItem(COMPLETED_STORAGE_KEY);
    localStorage.removeItem(LAST_AIR_STORAGE_KEY);
    localStorage.removeItem(LAST_PLAN_STORAGE_KEY);
    setCompletedIds([]);
    setSimulateSmog(false);
    setPlan(null);
    setProfile(DEFAULT_PROFILE);
    setShowOnboarding(true);
    notify("Local profile & check-offs reset");
  };

  const navItems: Array<{ id: TabId; label: string; icon: typeof Home }> = [
    { id: "home", label: t.nav.home, icon: Home },
    { id: "plan", label: t.nav.plan, icon: ListChecks },
    { id: "ask", label: t.nav.ask, icon: MessageCircle },
    { id: "community", label: t.nav.community, icon: Share2 },
    { id: "profile", label: t.nav.profile, icon: User },
  ];

  return (
    <div data-aqi-band={activeBandKey} className="min-h-dvh flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 justify-between z-30">
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="h-9 w-9 rounded-2xl bg-[var(--aqi-accent)] text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                S
              </span>
              <div>
                <p className="font-extrabold tracking-tight text-lg leading-none">
                  {t.appName}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">{t.tagline}</p>
              </div>
            </div>
          </div>

          <nav aria-label="Main navigation" className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "w-full min-h-[44px] px-3.5 rounded-2xl flex items-center gap-3 text-sm font-semibold transition-colors cursor-pointer",
                    active
                      ? "bg-[var(--aqi-accent-soft)] text-[var(--aqi-badge-text)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      active ? "text-[var(--aqi-accent)]" : "text-[var(--text-muted)]"
                    )}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Desktop Quick Controls */}
        <div className="space-y-2.5 pt-4 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            data-testid="desktop-simulator-toggle"
            onClick={() => handleSimulatorToggle(!simulateSmog)}
            className={cn(
              "w-full min-h-[44px] px-3 rounded-[var(--radius-control)] border text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors",
              simulateSmog
                ? "bg-[var(--aqi-accent)] text-white border-[var(--aqi-accent)]"
                : "bg-[var(--bg-canvas)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]"
            )}
          >
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Smog Sim (~312)
            </span>
            <span>{simulateSmog ? "ON" : "OFF"}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                handleScaleChange(profile.aqiScale === "cpcb" ? "us" : "cpcb")
              }
              className="min-h-[44px] rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] cursor-pointer"
            >
              {profile.aqiScale === "cpcb" ? t.badges.cpcb : t.badges.us}
            </button>
            <button
              type="button"
              onClick={() =>
                handleLanguageChange(profile.language === "en" ? "hi" : "en")
              }
              className="min-h-[44px] rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] inline-flex items-center justify-center gap-1 cursor-pointer"
            >
              <Languages className="h-3.5 w-3.5" />
              {profile.language === "en" ? "हिन्दी" : "EN"}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-[11px] font-medium text-[var(--text-muted)]">
            <Link href="/settings" className="hover:text-[var(--text-primary)] hover:underline">
              Settings
            </Link>
            <Link href="/privacy" className="hover:text-[var(--text-primary)] hover:underline">
              Privacy
            </Link>
            <Link href="/disclaimer" className="hover:text-[var(--text-primary)] hover:underline">
              Disclaimer
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 pb-24 md:pb-10">
        {/* Mobile Top Bar */}
        <header className="sticky top-0 z-20 md:hidden bg-[var(--bg-surface-elevated)] backdrop-blur-md border-b border-[var(--border-subtle)] px-4 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-xl bg-[var(--aqi-accent)] text-white flex items-center justify-center font-extrabold text-sm">
              S
            </span>
            <div>
              <p className="text-sm font-extrabold leading-none">{t.appName}</p>
              <p className="text-[11px] text-[var(--text-muted)] truncate max-w-[140px]">
                {profile.location.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              data-testid="mobile-simulator-toggle"
              onClick={() => handleSimulatorToggle(!simulateSmog)}
              className={cn(
                "min-h-[44px] px-2.5 rounded-xl border text-[11px] font-bold cursor-pointer",
                simulateSmog
                  ? "bg-[var(--aqi-accent)] text-white border-[var(--aqi-accent)]"
                  : "bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
              )}
            >
              {simulateSmog ? "Sim 312" : "Sim"}
            </button>
            <button
              type="button"
              onClick={() =>
                handleScaleChange(profile.aqiScale === "cpcb" ? "us" : "cpcb")
              }
              className="min-h-[44px] px-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[11px] font-bold text-[var(--text-secondary)] cursor-pointer"
            >
              {profile.aqiScale === "cpcb" ? "CPCB" : "US"}
            </button>
            <button
              type="button"
              aria-label="Toggle language"
              onClick={() =>
                handleLanguageChange(profile.language === "en" ? "hi" : "en")
              }
              className="min-h-[44px] min-w-[44px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-bold text-[var(--text-secondary)] inline-flex items-center justify-center cursor-pointer"
            >
              {profile.language === "en" ? "हि" : "EN"}
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-5">
          {/* Status Banners: Offline / Simulator / Demo Data (reserved min-height prevents CLS) */}
          <div className="min-h-[30px] flex flex-wrap items-center gap-2">
            {isOffline && (
              <Badge tone="warning">
                <WifiOff className="h-3.5 w-3.5" />
                {t.badges.offline}
              </Badge>
            )}
            {air?.isSimulated && (
              <Badge tone="accent" className="font-bold">
                <AlertTriangle className="h-3.5 w-3.5" />
                {t.badges.simulating}
              </Badge>
            )}
            {!air?.isSimulated && air?.isDemoData && (
              <Badge tone="neutral">
                <ShieldAlert className="h-3.5 w-3.5" />
                {t.badges.demoData}
              </Badge>
            )}
            {profile.isDemoProfile && (
              <Badge tone="neutral">
                Demo Family Active ({profile.location.name})
              </Badge>
            )}
          </div>

          {/* HOME TAB */}
          {activeTab === "home" && (
            <>
              {airLoading && !air ? (
                <div className="space-y-5">
                  <Skeleton className="h-[236px] w-full" />
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <Skeleton className="h-80 lg:col-span-7" />
                    <Skeleton className="h-80 lg:col-span-5" />
                  </div>
                </div>
              ) : airError && !air ? (
                <Card className="text-center py-10 space-y-3">
                  <AlertTriangle className="h-8 w-8 mx-auto text-[var(--aqi-accent)]" />
                  <p className="font-semibold">{airError}</p>
                  <Button onClick={() => void fetchAir(profile, simulateSmog)}>
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </Button>
                </Card>
              ) : air ? (
                <div className="space-y-5">
                  <HeroAqiCard
                    air={air}
                    scale={profile.aqiScale}
                    language={profile.language}
                    verdictOverride={plan?.verdict}
                  />

                  {/* Cleanest Window + Protected Summary (2-col on desktop) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="lg:col-span-7 space-y-5">
                      <ForecastChart
                        hourly={air.hourly}
                        cleanestWindow={air.cleanestWindow}
                        scale={profile.aqiScale}
                        title={t.home.forecastTitle}
                        subtitle={t.home.forecastSub}
                      />

                      <PollutantGrid
                        pollutants={air.pollutants}
                        language={profile.language}
                        title={t.home.pollutantsTitle}
                        subtitle={t.home.pollutantsSub}
                      />
                    </div>

                    <div className="lg:col-span-5 space-y-5">
                      {/* Cleanest Outdoor Window Highlight */}
                      <Card className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <h2 className="text-base font-bold flex items-center gap-2">
                            <Clock
                              className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                              aria-hidden="true"
                            />
                            {t.home.cleanestWindow}
                          </h2>
                          <Badge tone="success" className="tabular-nums">
                            AQI ~{air.cleanestWindow.avgCpcbAqi}
                          </Badge>
                        </div>
                        <p className="text-2xl font-extrabold tabular-nums">
                          {air.cleanestWindow.startLabel} – {air.cleanestWindow.endLabel}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {air.cleanestWindow.summary}
                        </p>
                      </Card>

                      {/* Household Per-Person Health Advice Chips */}
                      <Card className="space-y-3">
                        <h2 className="text-base font-bold">{t.home.householdAdvice}</h2>
                        <div className="space-y-2.5">
                          {advisories.map((adv) => (
                            <div
                              key={adv.group}
                              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-1"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-bold">
                                  {profile.language === "hi" ? adv.titleHi : adv.title}
                                </span>
                                <Badge
                                  tone={
                                    adv.status === "safe"
                                      ? "success"
                                      : adv.status === "caution"
                                      ? "warning"
                                      : "accent"
                                  }
                                >
                                  {adv.countText}
                                </Badge>
                              </div>
                              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                {profile.language === "hi" ? adv.adviceHi : adv.advice}
                              </p>
                            </div>
                          ))}
                        </div>
                      </Card>

                      {/* Quick Action Plan CTA */}
                      <Card className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <h2 className="text-base font-bold flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-[var(--aqi-accent)]" />
                            {t.home.protectedToday}
                          </h2>
                          <span className="text-xs font-bold tabular-nums text-[var(--aqi-accent)]">
                            -{totalPm25Protected} µg/m³
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {completedCount} {t.plan.progressLabel}. Follow today’s personalized
                          indoor hacks and low-emission swaps.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Button className="w-full" onClick={() => setActiveTab("plan")}>
                            <CheckCircle2 className="h-4 w-4" />
                            {t.home.openPlan}
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setActiveTab("community")}
                          >
                            <Share2 className="h-4 w-4" />
                            Share Brief
                          </Button>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          )}

          {/* PLAN TAB */}
          {activeTab === "plan" && (
            <PlanSection
              plan={plan}
              loading={planLoading}
              error={planError}
              onRetry={() => air && void fetchPlan(profile, air)}
              completedIds={completedIds}
              onToggleComplete={toggleCompleted}
              onInspectImpact={(action) => setInspectedAction(action)}
              language={profile.language}
            />
          )}

          {/* ASK SAANS TAB */}
          {activeTab === "ask" && air && (
            <AskSaansChat
              air={air}
              profile={profile}
              plan={plan}
              language={profile.language}
            />
          )}

          {/* COMMUNITY TAB */}
          {activeTab === "community" && air && (
            <CommunityBrief
              air={air}
              language={profile.language}
              onNotify={notify}
            />
          )}

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <ProfileControls
              profile={profile}
              simulateSmog={simulateSmog}
              onToggleSimulator={handleSimulatorToggle}
              onChangeScale={handleScaleChange}
              onChangeLanguage={handleLanguageChange}
              onLoadDemoHousehold={handleLoadDemo}
              onOpenOnboarding={() => setShowOnboarding(true)}
              onResetAll={handleReset}
            />
          )}

          <footer className="border-t border-[var(--border-subtle)] pt-4 pb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
            <span>
              Saans · Open-Meteo Air &amp; Weather · Deterministic Indoor Impact Math
            </span>
            <div className="flex items-center gap-4 font-medium">
              <Link href="/settings" className="hover:text-[var(--text-primary)] hover:underline">
                Settings
              </Link>
              <Link href="/privacy" className="hover:text-[var(--text-primary)] hover:underline">
                Privacy
              </Link>
              <Link href="/disclaimer" className="hover:text-[var(--text-primary)] hover:underline">
                Disclaimer
              </Link>
            </div>
          </footer>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 inset-x-0 z-30 md:hidden bg-[var(--bg-surface-elevated)] backdrop-blur-lg border-t border-[var(--border-subtle)] px-2 py-1.5"
      >
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "min-h-[46px] rounded-2xl flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold cursor-pointer transition-colors",
                  active ? "text-[var(--aqi-accent)]" : "text-[var(--text-muted)]"
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Onboarding & Impact Explainer Modals */}
      {showOnboarding && (
        <OnboardingModal
          open={showOnboarding}
          initialProfile={profile}
          onComplete={(nextProfile) => {
            persistProfile(nextProfile);
            setShowOnboarding(false);
            notify("Household profile saved locally", "success");
          }}
          onSkip={() => {
            persistProfile({ ...profile, onboarded: true });
            setShowOnboarding(false);
          }}
          onLoadDemo={handleLoadDemo}
        />
      )}

      <ImpactExplainerModal
        action={inspectedAction}
        language={profile.language}
        onClose={() => setInspectedAction(null)}
      />

      <ToastBanner toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
