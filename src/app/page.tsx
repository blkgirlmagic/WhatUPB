import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { CloudLogo } from "@/components/cloud-logo";
import { DiagonalLines } from "@/components/diagonal-lines";
import { ChatParallax } from "@/components/chat-parallax";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="landing-page">
      <div className="bloom" />
      <DiagonalLines />
      <ChatParallax />

      {/* Floating chat messages */}
      <div className="chat-float cf1">
        <div className="msg">💬 &ldquo;ok honestly&hellip; your fits ARE fire&rdquo;</div>
      </div>
      <div className="chat-float cf2">
        <div className="msg">🔥 &ldquo;that meeting could&rsquo;ve been an email&rdquo;</div>
      </div>
      <div className="chat-float cf3">
        <div className="msg">💜 &ldquo;you deserve that promotion fr&rdquo;</div>
      </div>
      <div className="chat-float cf4">
        <div className="msg">👀 &ldquo;someone out here misses you ngl&rdquo;</div>
      </div>
      <div className="chat-float cf5">
        <div className="msg">✨ &ldquo;your energy today was IT&rdquo;</div>
      </div>

      {/* Nav */}
      <nav className="landing-nav">
        <Link href="/" className="nav-logo">
          <div className="logo-mark">
            <CloudLogo />
          </div>
          WhatUPB
        </Link>
        <div className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#safety">Safety</a>
          <a href="#">Blog</a>
          {user ? (
            <Link href="/inbox" className="nav-cta">
              Go to Inbox
            </Link>
          ) : (
            <Link href="/signup" className="nav-cta">
              Create Account
            </Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="mascot-wrap">
          <CloudLogo
            width={90}
            height={74}
            className="mascot-svg"
            showShadow
            showExtraHighlights
          />
        </div>

        <div className="hero-wordmark">WhatUPB</div>
        <p className="hero-sub">
          Say what people <em>really</em> think — anonymously.
          <br />
          No handles. No trace. Just honest vibes.
        </p>

        <div className="cta-row">
          {user ? (
            <>
              <Link href="/inbox" className="btn-ghost">
                Go to Inbox <span className="arrow">↗</span>
              </Link>
              <Link href="/settings" className="btn-filled">
                Settings <span className="arrow">↗</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Log In <span className="arrow">↗</span>
              </Link>
              <Link href="/signup" className="btn-filled">
                Get Your Link — Free <span className="arrow">↗</span>
              </Link>
            </>
          )}
        </div>

        {/* Glass card */}
        <div className="glass-card">
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="card-label">Your anonymous link</div>
            <div className="card-headline">
              Hear the truth people
              <br />
              never say out loud.
            </div>
            <p className="card-body">
              Share your link anywhere. Friends send honest thoughts — zero
              fear, zero trace. AI blocks every abusive message before you ever
              see it.
            </p>
            <Link href="/signup">
              <button className="card-btn-primary">
                ✦ Get Your Link — Free
              </button>
            </Link>
            <Link href="/login">
              <button className="card-btn-secondary">Log In</button>
            </Link>
            <div className="trust-row">
              <div className="trust-item">
                <div className="t-check">✓</div>
                <span>Abuse auto-blocked</span>
              </div>
              <div className="trust-item">
                <div className="t-check">✓</div>
                <span>Fully anonymous</span>
              </div>
              <div className="trust-item">
                <div className="t-check">✓</div>
                <span>30 seconds</span>
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-hint">
          <div className="scroll-line" />
        </div>
      </section>

      {/* Stats */}
      <div className="stats-strip">
        <div className="stat">
          <div className="stat-num">50K+</div>
          <div className="stat-label">Messages sent</div>
        </div>
        <div className="stat-sep" />
        <div className="stat">
          <div className="stat-num">12K+</div>
          <div className="stat-label">Links created</div>
        </div>
        <div className="stat-sep" />
        <div className="stat">
          <div className="stat-num">99%</div>
          <div className="stat-label">Abuse blocked</div>
        </div>
        <div className="stat-sep" />
        <div className="stat">
          <div className="stat-num">Zero</div>
          <div className="stat-label">Identity leaks</div>
        </div>
      </div>

      {/* How it works */}
      <div id="how-it-works" className="section">
        <div className="s-eyebrow">How It Works</div>
        <div className="s-title">Three steps to real talk.</div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">01</div>
            <div className="step-title">Create Your Link</div>
            <p className="step-body">
              Get your unique WhatUPB link in under 30 seconds. No card, no
              setup.
            </p>
          </div>
          <div className="step-card">
            <div className="step-num">02</div>
            <div className="step-title">Share Everywhere</div>
            <p className="step-body">
              Drop it in your bio, story, WhatsApp. Let people know the door
              is open.
            </p>
          </div>
          <div className="step-card">
            <div className="step-num">03</div>
            <div className="step-title">Read the Truth</div>
            <p className="step-body">
              Messages come in moderated by AI in real time. No hate — just
              honest feedback.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bottom-cta">
        <div className="bc-title">
          Ready for honest
          <br />
          conversations?
        </div>
        <p className="bc-sub">
          Join thousands already hearing what people really think.
        </p>
        <Link href="/signup" className="bc-btn">
          Create Your Free Link <span className="arrow">↗</span>
        </Link>
      </div>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo-row">
              <CloudLogo width={32} height={28} />
              <span className="footer-wordmark">WhatUPB</span>
            </div>
            <p className="footer-tagline">
              Built for honest conversations.
              <br />
              No human review of messages — ever.
            </p>
          </div>
          <div className="footer-links-col">
            <div className="footer-col-label">Links</div>
            <div className="footer-links-row">
              <Link href="/">Home</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/content-policy">Content Policy</Link>
              <a href="#safety">Safety</a>
              <a href="#">Support</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 WhatUPB. All rights reserved.</span>
          <span>whatupb.com</span>
        </div>
      </footer>
    </div>
  );
}
