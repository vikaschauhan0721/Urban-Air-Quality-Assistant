"use client";

import { useState } from "react";
import { Check, Copy, Download, Share2, Users } from "lucide-react";
import { getCpcbBand } from "@/lib/aqi";
import { getCopy } from "@/lib/i18n";
import { BAND_META } from "@/lib/theme";
import type { AirQualityReport, Language } from "@/lib/types";
import { AqiCategoryBadge } from "./AqiBadge";
import { Button, Card } from "./ui/primitives";

const COLLECTIVE_ACTIONS_EN = [
  "Keep school-gate engines off while waiting (cuts localized NO2 & PM2.5 right where kids stand).",
  "Compost fallen winter leaves in society pits instead of morning leaf-burning.",
  "Coordinate 2-family school or metro carpools & wet-sweep common building corridors.",
];

const COLLECTIVE_ACTIONS_HI = [
  "स्कूल गेट पर इंतज़ार करते समय गाड़ी का इंजन बंद रखें।",
  "सुबह सूखे पत्ते जलाने के बजाय सोसाइटी कम्पोस्ट पिट में डालें।",
  "2 परिवारों के साथ स्कूल/मेट्रो कारपूल करें और कॉरिडोर में सूखी झाड़ू की जगह गीला पोंछा लगाएँ।",
];

export function CommunityBrief({
  air,
  language,
  onNotify,
}: {
  air: AirQualityReport;
  language: Language;
  onNotify?: (text: string, tone?: "info" | "success") => void;
}) {
  const [copied, setCopied] = useState(false);
  const t = getCopy(language);
  const band = getCpcbBand(air.cpcbAqi);
  const collective = language === "hi" ? COLLECTIVE_ACTIONS_HI : COLLECTIVE_ACTIONS_EN;

  const whatsappText =
    language === "hi"
      ? `*साँस (Saans) मोहल्ला एयर ब्रीफ़ — ${air.location.name}*\n` +
        `- आज का CPCB AQI: *${air.cpcbAqi} (${band.labelHi})* | PM2.5: ${air.pollutants.pm2_5} µg/m³\n` +
        `- बाहर जाने का सबसे साफ समय: *${air.cleanestWindow.startLabel}–${air.cleanestWindow.endLabel}*\n\n` +
        `*3 सामूहिक कदम:*\n` +
        collective.map((c, i) => `${i + 1}. ${c}`).join("\n") +
        `\n\nबाहर जाते समय फिट N95/FFP2 मास्क पहनें। यह सामान्य जानकारी है, चिकित्सीय सलाह नहीं।`
      : `*Saans Community Air Brief — ${air.location.name}*\n` +
        `- Today's CPCB AQI: *${air.cpcbAqi} (${air.categoryLabel})* | PM2.5: ${air.pollutants.pm2_5} µg/m³\n` +
        `- Cleanest outdoor window: *${air.cleanestWindow.startLabel}–${air.cleanestWindow.endLabel}*\n\n` +
        `*3 Collective Actions for Today:*\n` +
        collective.map((c, i) => `${i + 1}. ${c}`).join("\n") +
        `\n\nUse fitted N95/FFP2 outdoors in Poor+ air. Guidance only, not medical advice.`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(whatsappText);
      setCopied(true);
      onNotify?.("WhatsApp air brief copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2200);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = whatsappText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      onNotify?.("WhatsApp air brief copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleDownloadCard = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const accent = BAND_META[air.bandKey].accentHex;

    // Background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, 1080, 1080);

    // Top accent gradient card
    const grad = ctx.createLinearGradient(60, 60, 1020, 440);
    grad.addColorStop(0, accent);
    grad.addColorStop(1, "#1e293b");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(60, 60, 960, 350, 36);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px system-ui, sans-serif";
    ctx.fillText("SAANS · COMMUNITY AIR BRIEF", 104, 130);

    ctx.font = "600 32px system-ui, sans-serif";
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText(air.location.name, 104, 185);

    ctx.fillStyle = "#ffffff";
    ctx.font = "800 124px system-ui, sans-serif";
    ctx.fillText(String(air.cpcbAqi), 104, 335);

    ctx.font = "bold 38px system-ui, sans-serif";
    ctx.fillText(`CPCB AQI · ${air.categoryLabel}`, 340, 290);
    ctx.font = "500 28px system-ui, sans-serif";
    ctx.fillStyle = "#f1f5f9";
    ctx.fillText(
      `Cleanest window: ${air.cleanestWindow.startLabel}–${air.cleanestWindow.endLabel}  |  PM2.5: ${air.pollutants.pm2_5} µg/m³`,
      340,
      342
    );

    // Collective actions section
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.roundRect(60, 448, 960, 500, 36);
    ctx.fill();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 32px system-ui, sans-serif";
    ctx.fillText("3 COLLECTIVE ACTIONS FOR TODAY", 104, 520);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "500 29px system-ui, sans-serif";
    COLLECTIVE_ACTIONS_EN.forEach((line, idx) => {
      const yBase = 595 + idx * 112;
      ctx.fillText(`${idx + 1}. ${line.slice(0, 56)}`, 104, yBase);
      if (line.length > 56) {
        ctx.fillText(`    ${line.slice(56)}`, 104, yBase + 38);
      }
    });

    ctx.fillStyle = "#94a3b8";
    ctx.font = "500 24px system-ui, sans-serif";
    ctx.fillText(
      "Saans — Breathe easier, one choice at a time · Not medical advice",
      104,
      1006
    );

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `saans-air-brief-${air.cpcbAqi}.png`;
    link.click();
    onNotify?.("Image card downloaded", "success");
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Share2 className="h-5 w-5 text-[var(--aqi-accent)]" aria-hidden="true" />
              {t.community.title}
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{t.community.subtitle}</p>
          </div>
          <AqiCategoryBadge bandKey={air.bandKey} language={language} />
        </div>

        {/* Visual Brief Preview Card */}
        <div className="hero-surface p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {air.location.name}
              </p>
              <p className="text-3xl font-extrabold tabular-nums mt-0.5">
                {air.cpcbAqi}{" "}
                <span className="text-base font-semibold text-[var(--text-secondary)]">
                  CPCB AQI · PM2.5 {air.pollutants.pm2_5} µg/m³
                </span>
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-200 tabular-nums">
              Cleanest: {air.cleanestWindow.startLabel}–{air.cleanestWindow.endLabel}
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--aqi-accent)] flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {t.community.collectiveTitle}
            </p>
            <ol className="space-y-2">
              {collective.map((item, i) => (
                <li
                  key={i}
                  className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3.5 py-2.5 text-sm flex items-start gap-2.5"
                >
                  <span className="h-6 w-6 shrink-0 rounded-full bg-[var(--aqi-accent-soft)] text-[var(--aqi-badge-text)] font-bold text-xs flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleCopy} data-testid="copy-whatsapp-btn">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? t.community.copied : t.community.copyWhatsapp}
          </Button>
          <Button variant="outline" onClick={handleDownloadCard} data-testid="download-card-btn">
            <Download className="h-4 w-4" />
            {t.community.downloadCard}
          </Button>
        </div>

        <details className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 text-xs">
          <summary className="cursor-pointer font-semibold text-[var(--text-secondary)]">
            Preview WhatsApp text
          </summary>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-[var(--text-primary)] leading-relaxed">
            {whatsappText}
          </pre>
        </details>
      </Card>
    </div>
  );
}
