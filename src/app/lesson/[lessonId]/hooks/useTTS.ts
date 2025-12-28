"use client";

import { useEffect, useRef, useState } from "react";

export function useTTS() {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        if (typeof window === "undefined" || !window.speechSynthesis) return;
        const synth = window.speechSynthesis;
        const loadVoices = () => {
            const got = synth.getVoices();
            if (got && got.length) setVoices(got);
        };
        loadVoices();
        synth.onvoiceschanged = loadVoices;
        return () => {
            synth.cancel();
        };
    }, []);

    const speak = (text: string, options?: { voice?: SpeechSynthesisVoice; rate?: number; pitch?: number; volume?: number }) => {
        if (typeof window === "undefined" || !window.speechSynthesis) return;
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        if (options?.voice) utterance.voice = options.voice;
        if (typeof options?.rate === "number") utterance.rate = options!.rate;
        if (typeof options?.pitch === "number") utterance.pitch = options!.pitch;
        if (typeof options?.volume === "number") utterance.volume = options!.volume;
        utterance.onend = () => {
            setIsSpeaking(false);
            utteranceRef.current = null;
        };
        utterance.onerror = () => {
            setIsSpeaking(false);
            utteranceRef.current = null;
        };
        utteranceRef.current = utterance;
        synth.cancel();
        synth.speak(utterance);
        setIsSpeaking(true);
    };

    const cancel = () => {
        if (typeof window === "undefined" || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        utteranceRef.current = null;
    };

    return { voices, isSpeaking, speak, cancel };
}


