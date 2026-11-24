"use client";

import { useState } from "react";
import { AlertTriangle, Send, Sparkles } from "lucide-react";
import { getCopy } from "@/lib/i18n";
import type { AirQualityReport, ChatMessage, Language, PlanResponse, UserProfile } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Button, Card } from "./ui/primitives";

const SUGGESTED_QUESTIONS_EN = [
  "Is it safe for my child to walk to school today?",
  "When is the best window to open windows?",
  "Can I use a cloth mask or indoor plants for smog?",
  "DIY box-fan filter vs buying a purifier?",
];

const SUGGESTED_QUESTIONS_HI = [
  "क्या आज बच्चे का पैदल स्कूल जाना सुरक्षित है?",
  "खिड़कियाँ खोलने का सबसे अच्छा समय कब है?",
  "क्या कपड़े का मास्क या पौधे धुंध रोकते हैं?",
  "बॉक्स-फैन फ़िल्टर और प्यूरीफायर में क्या बेहतर है?",
];

export function AskSaansChat({
  air,
  profile,
  plan,
  language,
}: {
  air: AirQualityReport;
  profile: UserProfile;
  plan: PlanResponse | null;
  language: Language;
}) {
  const t = getCopy(language);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestions = language === "hi" ? SUGGESTED_QUESTIONS_HI : SUGGESTED_QUESTIONS_EN;

  const planSummary = plan
    ? plan.actions
        .slice(0, 6)
        .map((a) => `${a.title} (${a.impact.beforeAfterLabel})`)
        .join("; ")
    : "";

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (streaming) return;
    if (trimmed.length < 2) {
      setError("Please type a short question (at least 2 characters).");
      return;
    }

    setError(null);
    const nextHistory: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages([...nextHistory, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextHistory,
          profile,
          air,
          planSummary,
        }),
      });

      if (!res.ok) {
        const errJson = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errJson?.error ?? "Unable to get an answer right now.");
      }

      if (!res.body) {
        throw new Error("Empty chat stream");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunkText = decoder.decode(value, { stream: true });
        if (!chunkText) continue;
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = {
            role: "assistant",
            content: `${last?.content ?? ""}${chunkText}`,
          };
          return updated;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reach Saans.");
      setMessages(nextHistory);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[var(--aqi-accent)]" aria-hidden="true" />
              {t.ask.title}
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{t.ask.subtitle}</p>
          </div>
          <span className="rounded-full bg-[var(--aqi-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--aqi-badge-text)] tabular-nums">
            {air.location.name} · AQI {air.cpcbAqi}
          </span>
        </div>

        {/* Suggested prompts */}
        <div className="flex flex-wrap gap-2">
          {suggestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => void sendMessage(q)}
              disabled={streaming}
              className="min-h-[44px] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2 text-left text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--aqi-accent)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Conversation Window */}
        <div
          aria-live="polite"
          className="min-h-[240px] max-h-[420px] overflow-y-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 space-y-3"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10 text-sm text-[var(--text-muted)]">
              <p>Ask anything about today’s air quality, indoor protection, or commute swaps.</p>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                    m.role === "user"
                      ? "bg-[var(--aqi-accent)] text-white"
                      : "bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  )}
                >
                  {m.content || (streaming && idx === messages.length - 1 ? "Thinking..." : "")}
                </div>
              </div>
            ))
          )}
        </div>

        {error && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
        )}

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendMessage(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (error) setError(null);
            }}
            placeholder={t.ask.placeholder}
            aria-label={t.ask.placeholder}
            maxLength={600}
            className="flex-1 min-h-[46px] rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
          <Button type="submit" disabled={streaming}>
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">{t.ask.send}</span>
          </Button>
        </form>

        <div className="rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-3 flex items-start gap-2 text-xs text-[var(--text-muted)]">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" aria-hidden="true" />
          <span>{t.ask.disclaimer}</span>
        </div>
      </Card>
    </div>
  );
}
