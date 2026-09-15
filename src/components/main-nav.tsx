"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NewsletterModal } from "./newsletter";

const navLinks = [
  { href: "/capitol", label: "Capitol" },
  { href: "/policy", label: "Policy" },
  { href: "/chains", label: "Chains" },
  { href: "/tokens", label: "Tokens" },
  { href: "/signals", label: "Signals" },
  { href: "/intelligence", label: "Intelligence" },
  { href: "/about", label: "About" },
];

// Single sequence — duplicated below for seamless CSS -50% loop
const TICKER_SEQUENCE = [
  { sym: "SPY",      val: "+0.4%",  up: true  },
  { sym: "S&P 500",  val: "5,612",  up: true  },
  { sym: "NASDAQ",   val: "+0.6%",  up: true  },
  { sym: "DXY",      val: "−0.3%",  up: false },
  { sym: "Gold",     val: "+0.8%",  up: true  },
  { sym: "10Y Yield",val: "4.38%",  up: false },
  { sym: "BTC",      val: "+2.1%",  up: true  },
  { sym: "ETH",      val: "+1.7%",  up: true  },
  { sym: "SOL",      val: "+3.4%",  up: true  },
  { sym: "BNB",      val: "+1.2%",  up: true  },
  { sym: "XRP",      val: "+0.9%",  up: true  },
  { sym: "DOGE",     val: "+1.5%",  up: true  },
  { sym: "ADA",      val: "+0.7%",  up: true  },
];

// Duplicate sequence so CSS translateX(-50%) produces a seamless loop
const tickerItems = [...TICKER_SEQUENCE, ...TICKER_SEQUENCE];

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

        {/* ── Tier 2: Ticker ── */}
        <div className="wb-ticker-wrap">
          <div className="wb-ticker-scroll">
            {tickerItems.map((item, i) => (
              <span key={i} className="wb-ticker-item">
                <span className="wb-ticker-sym">{item.sym}</span>
                <span className={`wb-ticker-val ${item.up ? "up" : "down"}`}>
                  {item.val}
                </span>
              </span>
            ))}
          </div>
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
