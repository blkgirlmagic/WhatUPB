"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NewsletterModal } from "./newsletter";
import TvTicker from "./tv-ticker";

const navLinks = [
  { href: "/capitol", label: "Capitol" },
  { href: "/policy", label: "Policy" },
  { href: "/chains", label: "Chains" },
  { href: "/tokens", label: "Tokens" },
  { href: "/signals", label: "Signals" },
  { href: "/intelligence", label: "Intelligence" },
  { href: "/about", label: "About" },
];

export default function MainNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <nav className="wb-nav">
        {/* ── Tier 1: Masthead ── */}
        <div className="wb-masthead">
          <Link href="/" className="wb-masthead-logo">
            WhatUPB
          </Link>
          <button
            className="wb-join-btn"
            onClick={() => setModalOpen(true)}
            aria-label="Join free newsletter"
          >
            JOIN FREE
          </button>
        </div>

        {/* ── Tier 2: Ticker (TradingView live feed) ── */}
        <div className="wb-ticker-wrap">
          <TvTicker />
        </div>

        {/* ── Tier 3: Subnav ── */}
        <div className="wb-subnav">
          <div className="wb-subnav-inner">
            <div className="wb-subnav-links">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`wb-subnav-link${
                    pathname?.startsWith(link.href) ? " active" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile hamburger — shown in subnav tier */}
            <button
              className="wb-hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="wb-mobile-menu">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`wb-mobile-link${
                  pathname?.startsWith(link.href) ? " active" : ""
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button
              className="wb-mobile-join-btn"
              onClick={() => {
                setMenuOpen(false);
                setModalOpen(true);
              }}
            >
              JOIN FREE
            </button>
          </div>
        )}
      </nav>

      {/* Newsletter modal — rendered outside nav so it can overlay everything */}
      <NewsletterModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
