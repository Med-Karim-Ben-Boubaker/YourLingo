"use client";

import { useEffect, useMemo } from "react";
import { useTTS } from "../hooks/useTTS";

interface ListenButtonProps {
    text: string;
    lang?: "en" | "de" | string;
    rate?: number;
    pitch?: number;
    volume?: number;
}

export function ListenButton({ text, lang = "en", rate = 1, pitch = 1, volume = 1 }: ListenButtonProps) {
    const { voices, isSpeaking, speak, cancel } = useTTS();

    const BROWSER_LANG_VOICE_MAP: Record<string, Record<string, string[]>> = {
        edge: {
            en: ["Microsoft Zira", "Microsoft David"],
            de: ["Microsoft Hedda", "Microsoft Katja"]
        },
        chrome: {
            en: ["Google UK English Female", "Google US English"],
            de: ["Google Deutsch", "Google Deutsch Male"]
        },
        safari: {
            en: ["Samantha", "Alex"],
            de: ["Anna"]
        },
        firefox: {
            en: [""],
            de: [""]
        },
        other: {
            en: [""],
            de: [""]
        }
    };

    function detectBrowser() {
        if (typeof navigator === "undefined") return "other";
        const ua = navigator.userAgent || "";
        if (ua.includes("Edg/")) return "edge";
        if (ua.includes("Chrome/") || ua.includes("Chromium/")) return "chrome";
        if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "safari";
        if (ua.includes("Firefox/")) return "firefox";
        return "other";
    }

    const browserKey = useMemo(() => detectBrowser(), []);

    function selectVoice() {
        if (!voices || voices.length === 0) return undefined;
        const map = BROWSER_LANG_VOICE_MAP[browserKey] || BROWSER_LANG_VOICE_MAP.other;
        const preferred = (map[lang] as string[]) || [];
        for (const substr of preferred) {
            if (!substr) continue;
            const found = voices.find((v) => v.name.toLowerCase().includes(substr.toLowerCase()));
            if (found) return found;
        }
        // fallback by language tag
        const langPrefix = String(lang).slice(0, 2).toLowerCase();
        const byLang = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(langPrefix));
        if (byLang) return byLang;
        return voices[0];
    }

    const chosenVoice = useMemo(() => selectVoice(), [voices, browserKey, lang]);

    function handleClick() {
        if (typeof window === "undefined" || !window.speechSynthesis) return;
        if (isSpeaking) {
            cancel();
            return;
        }
        speak(text, { voice: chosenVoice, rate, pitch, volume });
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-pressed={isSpeaking}
            aria-label="Listen to question"
            style={{ marginLeft: 8 }}
        >
            {/* Inline SVG speaker icon (presentational) */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M5 9v6h4l5 4V5L9 9H5z" fill="currentColor" />
                <path d="M16.5 9.4c.9.9 1.5 2.2 1.5 3.6s-.6 2.7-1.5 3.6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </button>
    );
}

export default ListenButton;


