"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowRight,
  Bookmark,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  Compass,
  Copy,
  Heart,
  RotateCcw,
  Shuffle,
  Sparkles,
  X,
} from "lucide-react";
import type { OrganId } from "../lib/anatomy-data";
import type { Organ } from "../i18n/merge";
import type { UiDictionary } from "../i18n/types";
import {
  DID_YOU_KNOW_DATABASE,
  type AnatomyFact,
} from "../lib/did-you-know-data";

interface HomePageProps {
  t: UiDictionary;
  organs: Organ[];
  onSelectOrgan: (id: OrganId) => void;
  onNavigateTab: (tab: "explore" | "lessons" | "library" | "notes") => void;
  onOpenSystemModal: () => void;
  onOpenLesson: (lessonId: string) => void;
  onOpenNotesForOrgan: (id: OrganId) => void;
}

const QUICK_FACTS_STRIP = [
  {
    stat: "206",
    label: "Bones in Adult Body",
    detail: "Stronger than reinforced steel ounce-for-ounce and continuously remodeling.",
    icon: "🦴",
  },
  {
    stat: "37 Trillion",
    label: "Living Cells",
    detail: "Operating in exquisite biological harmony every second of your life.",
    icon: "🧬",
  },
  {
    stat: "100,000",
    label: "Heartbeats / Day",
    detail: "Pumping ~7,500 liters of oxygenated blood through vascular pathways.",
    icon: "❤️",
  },
  {
    stat: "~5 Liters",
    label: "Blood Volume",
    detail: "Circulating through an incredible 60,000-mile network of blood vessels.",
    icon: "🩸",
  },
];

const BADGE_COLORS: Record<AnatomyFact["badge"], { bg: string; text: string; border: string }> = {
  "Superpower": { bg: "rgba(141, 107, 204, 0.12)", text: "#7954b5", border: "rgba(141, 107, 204, 0.25)" },
  "Mind-Blowing": { bg: "rgba(226, 109, 92, 0.12)", text: "#c25943", border: "rgba(226, 109, 92, 0.25)" },
  "Clinical Pearl": { bg: "rgba(99, 137, 184, 0.12)", text: "#3d6c9e", border: "rgba(99, 137, 184, 0.25)" },
  "Record": { bg: "rgba(217, 119, 36, 0.12)", text: "#b85d14", border: "rgba(217, 119, 36, 0.25)" },
  "Deep Biology": { bg: "rgba(118, 157, 116, 0.14)", text: "#4e7e4a", border: "rgba(118, 157, 116, 0.25)" },
  "Fun Fact": { bg: "rgba(235, 124, 107, 0.1)", text: "#d95338", border: "rgba(235, 124, 107, 0.2)" },
};

// Helper: Pick a random index across the entire fact database without repeating the current one
function getRandomFactIndex(excludeIndex?: number): number {
  const len = DID_YOU_KNOW_DATABASE.length;
  if (len <= 1) return 0;
  let next = Math.floor(Math.random() * len);
  if (excludeIndex !== undefined && next === excludeIndex) {
    next = (next + 1) % len;
  }
  return next;
}

export function HomePage({
  t,
  organs,
  onSelectOrgan,
  onNavigateTab,
  onOpenSystemModal,
  onOpenLesson,
  onOpenNotesForOrgan,
}: HomePageProps) {
  // Current featured fact index (picks random on client load)
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);

  // Hero fact cycle index
  const [heroFactIndex, setHeroFactIndex] = useState(0);

  // Utility states
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // 1. Pick a random fact on initial website open / client mount
  useEffect(() => {
    setCurrentFactIndex(getRandomFactIndex());
    setHeroFactIndex(getRandomFactIndex());
  }, []);

  // 2. Smooth transition handler for fact change
  const triggerFactChange = useCallback((nextIndex?: number) => {
    setIsShuffling(true);
    setTimeout(() => {
      setCurrentFactIndex((prev) => {
        return nextIndex !== undefined ? nextIndex : getRandomFactIndex(prev);
      });
      setCopied(false);
      setSaved(false);
      setIsShuffling(false);
    }, 200);
  }, []);

  // 3. Auto-update Fun Fact every 30 seconds (resets on manual Surprise Me)
  useEffect(() => {
    const timer = setInterval(() => {
      triggerFactChange();
    }, 30000); // 30 seconds

    return () => clearInterval(timer);
  }, [currentFactIndex, triggerFactChange]);

  const activeFact = DID_YOU_KNOW_DATABASE[currentFactIndex % DID_YOU_KNOW_DATABASE.length];
  const heroFact = DID_YOU_KNOW_DATABASE[heroFactIndex % DID_YOU_KNOW_DATABASE.length];

  // Random Fact Generator ("Surprise Me" button click)
  const handleSurpriseMe = () => {
    triggerFactChange();
  };

  const handleNextHeroFact = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setHeroFactIndex((prev) => (prev + 1) % DID_YOU_KNOW_DATABASE.length);
  };

  const handleCopyFact = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(
        `Did you know? ${activeFact.headline}: ${activeFact.fact} — via Inside Human+`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const badgeStyle = BADGE_COLORS[activeFact.badge] || BADGE_COLORS["Superpower"];

  return (
    <div className="homepage-root">
      {/* ===================== HERO SECTION ===================== */}
      <section className="home-hero-card" aria-label="Introduction to Inside Human">
        <div className="home-hero-grid">
          {/* Left Column: Typography & CTAs */}
          <div className="home-hero-content">
            <div className="hero-eyebrow">
              <Sparkles size={14} className="eyebrow-sparkle" />
              <span>EXPLORE • LEARN • UNDERSTAND</span>
            </div>

            <h1 className="hero-headline">
              Discover the <span className="headline-accent">Wonders</span> Inside You
            </h1>

            <p className="hero-subtext">
              A beautiful way to explore the human body. Learn how your organs, systems, and cells work
              together to keep you alive.
            </p>

            <div className="hero-cta-group">
              <button
                type="button"
                className="hero-primary-cta"
                onClick={() => {
                  onSelectOrgan("heart");
                  onNavigateTab("explore");
                }}
              >
                <span>Start Exploring</span>
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                className="hero-secondary-cta"
                onClick={onOpenSystemModal}
              >
                <BrainCircuit size={17} />
                <span>Explore Systems</span>
              </button>
            </div>

            <div className="hero-meta-strip">
              <div className="meta-pill">
                <span className="pill-dot" />
                <span>12+ Body Systems</span>
              </div>
              <div className="meta-pill">
                <span className="pill-dot" />
                <span>Interactive 3D Specimens</span>
              </div>
              <div className="meta-pill">
                <span className="pill-dot" />
                <span>110+ Anatomy Curiosities</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Anatomical Illustration & Floating Cards */}
          <div className="home-hero-visual-wrapper">
            <div className="anatomy-visual-container">
              {/* Soft warm glow background */}
              <div className="anatomy-glow-halo" />

              {/* Main Realistic 3D Anatomical Human Body */}
              <img
                src="/hero-anatomy.jpg"
                alt="Detailed 3D anatomical illustration of human muscular, skeletal, circulatory and organ systems"
                className="anatomy-figure-img"
                loading="eager"
              />

              {/* Floating Circular Organ Cards with Connectors */}

              {/* 1. BRAIN (Top Left) */}
              <div
                className="floating-organ-card pos-brain"
                onClick={() => {
                  onSelectOrgan("brain");
                  onNavigateTab("explore");
                }}
                role="button"
                tabIndex={0}
                title="Explore Brain in 3D"
              >
                <div className="floating-organ-circle">
                  <img src="/anatomy/brain/thumb.webp" alt="Brain specimen" />
                  <span className="organ-pulse-ring" />
                </div>
                <div className="floating-organ-label">
                  <strong>Brain</strong>
                  <small>Nervous System</small>
                </div>
                <div className="connector-line conn-brain" />
              </div>

              {/* 2. HEART (Top Right) */}
              <div
                className="floating-organ-card pos-heart"
                onClick={() => {
                  onSelectOrgan("heart");
                  onNavigateTab("explore");
                }}
                role="button"
                tabIndex={0}
                title="Explore Heart in 3D"
              >
                <div className="floating-organ-circle is-heart">
                  <img src="/anatomy/heart/thumb.webp" alt="Heart specimen" />
                  <span className="heart-beat-pulse" />
                </div>
                <div className="floating-organ-label">
                  <div className="flex-row-center">
                    <strong>Heart</strong>
                    <span className="bpm-badge">72 BPM</span>
                  </div>
                  <small>Cardiovascular</small>
                </div>
                <div className="connector-line conn-heart" />
              </div>

              {/* 3. LUNGS (Mid Left) */}
              <div
                className="floating-organ-card pos-lungs"
                onClick={() => {
                  onSelectOrgan("lungs");
                  onNavigateTab("explore");
                }}
                role="button"
                tabIndex={0}
                title="Explore Lungs in 3D"
              >
                <div className="floating-organ-circle">
                  <img src="/anatomy/lungs/thumb.webp" alt="Lungs specimen" />
                  <span className="organ-pulse-ring" />
                </div>
                <div className="floating-organ-label">
                  <strong>Lungs</strong>
                  <small>Respiratory</small>
                </div>
                <div className="connector-line conn-lungs" />
              </div>

              {/* 4. STOMACH / INTESTINE (Lower Left) */}
              <div
                className="floating-organ-card pos-stomach"
                onClick={() => {
                  onSelectOrgan("intestine");
                  onNavigateTab("explore");
                }}
                role="button"
                tabIndex={0}
                title="Explore Digestive System in 3D"
              >
                <div className="floating-organ-circle">
                  <img src="/anatomy/intestine/thumb.webp" alt="Stomach and intestine" />
                  <span className="organ-pulse-ring" />
                </div>
                <div className="floating-organ-label">
                  <strong>Stomach</strong>
                  <small>Digestive System</small>
                </div>
                <div className="connector-line conn-stomach" />
              </div>

              {/* Floating "Did You Know?" Informational Card */}
              <div
                className="hero-did-you-know-card"
                onClick={() => {
                  setCurrentFactIndex(heroFactIndex);
                  // Smooth scroll to the fun fact card below
                  const element = document.getElementById("single-fun-fact-section");
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                }}
                role="button"
                tabIndex={0}
                title="Click to view this anatomical wonder below"
              >
                <div className="did-you-know-header">
                  <div className="did-you-know-title">
                    <span className="did-you-know-bulb">💡</span>
                    <span>Did you know?</span>
                  </div>
                  <button
                    type="button"
                    className="fact-cycle-btn"
                    onClick={handleNextHeroFact}
                    aria-label="Next wonder"
                    title="Next wonder"
                  >
                    <RotateCcw size={13} />
                  </button>
                </div>
                <h4 className="hero-fact-headline">{heroFact.headline}</h4>
                <p className="did-you-know-body">
                  “{heroFact.fact}”
                </p>
                <div className="did-you-know-footer">
                  <span className="fact-badge">{heroFact.category}</span>
                  <span className="fact-action-hint">
                    Explore wonder <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== QUICK FACTS STRIP ===================== */}
      <section className="quick-facts-strip-section" aria-label="Key Anatomical Statistics">
        <div className="quick-facts-container">
          <div className="quick-facts-grid">
            {QUICK_FACTS_STRIP.map((item, index) => (
              <div key={index} className="quick-fact-card">
                <div className="quick-fact-icon-wrapper">
                  <span className="quick-fact-emoji">{item.icon}</span>
                </div>
                <div className="quick-fact-content">
                  <div className="quick-fact-stat">{item.stat}</div>
                  <div className="quick-fact-label">{item.label}</div>
                  <p className="quick-fact-detail">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== SINGLE FUN FACT CARD WITH SURPRISE ME ===================== */}
      <section
        className="single-fun-fact-section"
        id="single-fun-fact-section"
        aria-label="Anatomical Curiosity Spotlight"
      >
        <div className={`standalone-fact-card ${isShuffling ? "is-shuffling" : ""}`}>
          {/* Left Column: Icon + Uppercase Category Name */}
          <div className="standalone-fact-left-col">
            <div className="standalone-fact-icon-box">
              <span className="standalone-fact-icon">{activeFact.icon}</span>
            </div>
            <span className="standalone-fact-category-label">
              {activeFact.category}
            </span>
          </div>

          {/* Right Column: Badge, Title, Description, Divider, Footer */}
          <div className="standalone-fact-right-col">
            {/* Top Row: Badge on left, Copy & Bookmark on right */}
            <div className="standalone-fact-top-row">
              <span
                className="standalone-fact-badge"
                style={{
                  backgroundColor: badgeStyle.bg,
                  color: badgeStyle.text,
                  borderColor: badgeStyle.border,
                }}
              >
                ★ {activeFact.badge.toUpperCase()}
              </span>

              <div className="standalone-fact-util-actions">
                <button
                  type="button"
                  className="standalone-util-btn"
                  onClick={handleCopyFact}
                  title="Copy wonder"
                  aria-label="Copy wonder text"
                >
                  {copied ? <Check size={15} color="#438954" /> : <Copy size={15} />}
                </button>
                <button
                  type="button"
                  className="standalone-util-btn"
                  onClick={() => setSaved(!saved)}
                  title="Bookmark this wonder"
                  aria-label="Bookmark this wonder"
                >
                  <Bookmark
                    size={15}
                    fill={saved ? "var(--home-coral)" : "none"}
                    color={saved ? "var(--home-coral)" : "currentColor"}
                  />
                </button>
              </div>
            </div>

            {/* Headline with Quotes */}
            <h2 className="standalone-fact-headline">
              “{activeFact.headline}”
            </h2>

            {/* Scientific Explanation Body */}
            <p className="standalone-fact-body">
              {activeFact.fact}
            </p>

            {/* Divider Rule */}
            <div className="standalone-fact-divider" />

            {/* Bottom Row: Focus on left, Surprise Me & 3D Explore on right */}
            <div className="standalone-fact-bottom-row">
              <div className="standalone-fact-focus-label">
                <span className="focus-sparkle-glyph">✨</span>
                <span>
                  Focus: <strong>{activeFact.organName || activeFact.category}</strong>
                </span>
              </div>

              <div className="standalone-fact-action-group">
                {/* Random Fact Generator: Surprise Me button */}
                <button
                  type="button"
                  className="standalone-surprise-btn"
                  onClick={handleSurpriseMe}
                  title="Generate another random anatomical wonder"
                >
                  <Shuffle size={15} className={isShuffling ? "spin-icon" : ""} />
                  <span>Surprise Me</span>
                </button>

                {/* 3D Explore button */}
                {activeFact.organId ? (
                  <button
                    type="button"
                    className="standalone-explore-3d-btn"
                    onClick={() => {
                      if (activeFact.organId) {
                        onSelectOrgan(activeFact.organId);
                        onNavigateTab("explore");
                      }
                    }}
                  >
                    <span>Explore {activeFact.organName || "Organ"} in 3D</span>
                    <ArrowRight size={15} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="standalone-explore-3d-btn"
                    onClick={() => onNavigateTab("explore")}
                  >
                    <span>Explore 3D Studio</span>
                    <ArrowRight size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="home-footer" role="contentinfo">
        <div className="footer-top-grid">
          {/* Brand Col */}
          <div className="footer-brand-col">
            <div className="footer-logo">
              <strong>Inside Human<sup>✦</sup></strong>
            </div>
            <p className="footer-tagline">
              “Understand your body. Understand yourself.”
            </p>
            <p className="footer-bio">
              A serene, medically accurate anatomy learning environment designed for students,
              artists, educators, and the curious mind.
            </p>
            <div className="footer-status-pill">
              <span className="status-live-dot" />
              <span>Version 2.5 • 110+ Anatomy Curiosities Active</span>
            </div>
          </div>

          {/* Quick Links: Navigation */}
          <div className="footer-links-col">
            <h4>Explore</h4>
            <ul>
              <li>
                <button type="button" onClick={() => onNavigateTab("explore")}>
                  3D Anatomy Studio
                </button>
              </li>
              <li>
                <button type="button" onClick={onOpenSystemModal}>
                  Body Systems
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateTab("library")}>
                  Organ Library
                </button>
              </li>
              <li>
                <button type="button" onClick={() => { onSelectOrgan("heart"); onNavigateTab("explore"); }}>
                  Microscopic Histology
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links: Learning */}
          <div className="footer-links-col">
            <h4>Learning</h4>
            <ul>
              <li>
                <button type="button" onClick={() => onNavigateTab("lessons")}>
                  Structured Lessons
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateTab("notes")}>
                  Study Notes & Mnemonics
                </button>
              </li>
              <li>
                <button type="button" onClick={handleSurpriseMe}>
                  Random Curiosity
                </button>
              </li>
              <li>
                <button type="button" onClick={() => { onSelectOrgan("heart"); onNavigateTab("explore"); }}>
                  Self-Assessment Quiz
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter / Study Tips */}
          <div className="footer-newsletter-col">
            <h4>Study Digest</h4>
            <p>Get high-yield weekly anatomy flashcards, 3D dissecting tips, and clinical updates.</p>
            {newsletterSubscribed ? (
              <div className="newsletter-success">
                <CheckCircle2 size={16} />
                <span>You are subscribed to the Anatomy Digest!</span>
              </div>
            ) : (
              <form
                className="newsletter-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newsletterEmail.trim()) setNewsletterSubscribed(true);
                }}
              >
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                />
                <button type="submit" aria-label="Subscribe">
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
            <small className="newsletter-privacy">
              No spam. Unsubscribe at any time. Verified medical content.
            </small>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            © {new Date().getFullYear()} Inside Human Inc. All rights reserved. Medically reviewed for educational reference.
          </div>
          <div className="footer-legal-links">
            <button type="button">Privacy Policy</button>
            <span>•</span>
            <button type="button">Terms of Study</button>
            <span>•</span>
            <button type="button">Medical Citations</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
