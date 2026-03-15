"use client";

import { useEffect, useRef, useCallback } from "react";

/* ── All styles scoped inside the component ── */
const css = `
.demo-root {
  margin: 0; padding: 0; min-height: 100dvh; min-height: 100vh;
  background: #f0eaff; display: flex; flex-direction: column;
  align-items: center; justify-content: flex-start;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
.demo {
  width: 100%; max-width: 390px; margin: 0 auto;
  background: #f0eaff; min-height: 100dvh; min-height: 100vh;
  position: relative;
}
.nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; position: sticky; top: 0; z-index: 10;
  background: rgba(240,234,255,0.92); backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.nav-logo {
  font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px;
  color: #1a1730; letter-spacing: -0.3px;
}
.nav-btn {
  padding: 8px 16px; border-radius: 50px; border: none;
  background: #6b5ce7; color: #fff; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
}
.page { padding: 0 20px 40px; }
.profile-section { text-align: center; margin-bottom: 24px; padding-top: 8px; }
.profile-label {
  font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase;
  color: #c9a84c; font-weight: 600; margin-bottom: 6px;
  font-family: 'IBM Plex Mono', monospace;
}
.profile-name {
  font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 800;
  color: #1a1730; letter-spacing: -0.5px;
}
.profile-name::first-letter { color: #c9a84c; }
.prompt-label {
  font-size: 11px; color: rgba(26,23,48,0.4); margin-bottom: 4px;
  font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.5px;
}
.prompt-text {
  font-family: 'Playfair Display', serif; font-style: italic;
  font-size: 16px; color: #6b5ce7; margin-bottom: 18px; line-height: 1.4;
}
.msg-box {
  background: #fff; border: 1.5px solid rgba(107,92,231,0.2);
  border-radius: 16px; padding: 16px; min-height: 120px;
  position: relative; margin-bottom: 14px;
  box-shadow: 0 2px 8px rgba(107,92,231,0.06);
  transition: border-color 0.3s;
}
.msg-box:has(.msg-typed[style*="display: block"]) {
  border-color: rgba(107,92,231,0.4);
}
.msg-placeholder {
  color: rgba(26,23,48,0.3); font-size: 15px; line-height: 1.6;
}
.msg-typed {
  display: none; font-size: 15px; color: #1a1730; line-height: 1.6;
  min-height: 40px;
}
.msg-cursor {
  display: inline-block; width: 2px; height: 18px; background: #6b5ce7;
  margin-left: 1px; vertical-align: text-bottom;
  animation: blink 0.8s infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
.char-count {
  position: absolute; bottom: 10px; right: 14px;
  font-size: 11px; color: rgba(26,23,48,0.25);
  font-family: 'IBM Plex Mono', monospace;
}
.send-btn {
  width: 100%; padding: 14px; border-radius: 14px; border: none;
  background: linear-gradient(135deg, #6b5ce7 0%, #9B8EE8 100%);
  color: #fff; font-size: 16px; font-weight: 700; cursor: pointer;
  box-shadow: 0 4px 16px rgba(107,92,231,0.3); transition: all 0.3s;
  font-family: inherit;
}
.send-success {
  display: none; text-align: center; padding: 14px;
  background: rgba(107,92,231,0.06); border: 1px solid rgba(107,92,231,0.15);
  border-radius: 14px; margin-bottom: 14px;
  animation: fadeIn 0.4s ease;
}
.success-text { font-size: 14px; color: #6b5ce7; font-weight: 500; }
@keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
.anon-note {
  text-align: center; font-size: 12px; color: rgba(26,23,48,0.35);
  margin-top: 12px; margin-bottom: 8px;
}
.divider {
  height: 1px; background: rgba(107,92,231,0.1);
  margin: 24px 0;
}
.reactions-label {
  font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase;
  color: #c9a84c; font-weight: 600; margin-bottom: 12px;
  font-family: 'IBM Plex Mono', monospace;
}
.reaction-card {
  background: #fff; border: 1px solid rgba(107,92,231,0.12);
  border-radius: 14px; padding: 14px 16px; margin-bottom: 8px;
  opacity: 0; transform: translateY(10px);
  transition: all 0.5s cubic-bezier(0.22,1,0.36,1);
}
.reaction-card.show { opacity: 1; transform: translateY(0); }
.reaction-text {
  font-family: 'Playfair Display', serif; font-style: italic;
  font-size: 15px; color: #1a1730; margin-bottom: 4px; line-height: 1.4;
}
.reaction-date {
  font-size: 11px; color: rgba(26,23,48,0.3);
  font-family: 'IBM Plex Mono', monospace;
}
.footer-logo {
  text-align: center; font-weight: 800; font-size: 20px; color: #1a1730;
  margin-bottom: 4px; letter-spacing: -0.3px;
}
.footer-url {
  text-align: center; font-size: 12px; color: rgba(26,23,48,0.35);
  margin-bottom: 16px;
}
.cta-btn {
  display: block; width: 100%; padding: 14px; border-radius: 50px;
  border: 1.5px solid #c9a84c; background: transparent;
  color: #1a1730; font-size: 15px; font-weight: 700; text-align: center;
  cursor: pointer; text-decoration: none; transition: all 0.2s;
  box-sizing: border-box;
}
.progress-bar {
  position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%);
  width: min(350px, calc(100% - 40px)); height: 3px;
  background: rgba(107,92,231,0.1); border-radius: 2px;
  overflow: hidden; z-index: 20;
}
.progress-fill {
  height: 100%; width: 0%; border-radius: 2px;
  background: linear-gradient(90deg, #c9a84c, #6b5ce7);
  transition: width 0.6s ease;
}
.step-indicator {
  position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
  display: flex; gap: 8px; z-index: 20;
}
.dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: rgba(107,92,231,0.2); transition: all 0.3s;
}
.dot.active {
  background: #6b5ce7; width: 20px; border-radius: 4px;
}
`;

export default function DemoClient() {
  const typedRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const charRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const sendRef = useRef<HTMLButtonElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const r1Ref = useRef<HTMLDivElement>(null);
  const r2Ref = useRef<HTMLDivElement>(null);
  const r3Ref = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const MESSAGE = "I just wanted you to know you made my day. \u{1F5A4}";

  const clearTimers = useCallback(() => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  }, []);

  const t = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timerRefs.current.push(id);
    return id;
  }, []);

  const setDot = useCallback((n: number) => {
    dotRefs.current.forEach((d, i) => {
      if (d) d.classList.toggle("active", i + 1 === n);
    });
  }, []);

  const setProgress = useCallback((p: number) => {
    if (progressRef.current) progressRef.current.style.width = p + "%";
  }, []);

  const reset = useCallback(() => {
    if (placeholderRef.current) placeholderRef.current.style.display = "block";
    if (typedRef.current) { typedRef.current.style.display = "none"; typedRef.current.innerHTML = ""; }
    if (charRef.current) charRef.current.innerText = "0 / 1000";
    if (successRef.current) successRef.current.style.display = "none";
    if (sendRef.current) sendRef.current.style.display = "block";
    [r1Ref, r2Ref, r3Ref].forEach(r => r.current?.classList.remove("show"));
    setDot(1);
    setProgress(0);
  }, [setDot, setProgress]);

  const step2 = useCallback(() => {
    setDot(2);
    setProgress(20);
    if (placeholderRef.current) placeholderRef.current.style.display = "none";
    if (typedRef.current) typedRef.current.style.display = "block";
    let pos = 0;
    function typeChar() {
      if (pos <= MESSAGE.length) {
        if (typedRef.current) {
          typedRef.current.innerHTML =
            MESSAGE.substring(0, pos) + '<span class="msg-cursor"></span>';
        }
        if (charRef.current) charRef.current.innerText = pos + " / 1000";
        pos++;
        timerRefs.current.push(setTimeout(typeChar, 60));
      }
    }
    typeChar();
  }, [MESSAGE, setDot, setProgress]);

  const step3 = useCallback(() => {
    setDot(3);
    setProgress(50);
    if (typedRef.current) typedRef.current.innerHTML = MESSAGE;
    if (charRef.current) charRef.current.innerText = MESSAGE.length + " / 1000";
    if (sendRef.current) sendRef.current.style.display = "none";
    if (successRef.current) successRef.current.style.display = "block";
  }, [MESSAGE, setDot, setProgress]);

  const step4 = useCallback(() => {
    setDot(4);
    setProgress(70);
    t(() => r1Ref.current?.classList.add("show"), 0);
    t(() => r2Ref.current?.classList.add("show"), 400);
    t(() => r3Ref.current?.classList.add("show"), 800);
  }, [setDot, setProgress, t]);

  const step5 = useCallback(() => {
    setDot(5);
    setProgress(100);
  }, [setDot, setProgress]);

  useEffect(() => {
    function runLoop() {
      reset();
      t(step2, 2000);
      t(step3, 6000);
      t(step4, 8000);
      t(step5, 11000);
      t(runLoop, 15000);
    }
    const startId = setTimeout(runLoop, 500);
    timerRefs.current.push(startId);
    return () => { clearTimers(); clearTimeout(startId); };
  }, [reset, step2, step3, step4, step5, t, clearTimers]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="demo-root">
        <div className="demo">
          <div className="nav">
            <div className="nav-logo">WhatUPB</div>
            <button className="nav-btn" type="button">Go to Inbox</button>
          </div>
          <div className="page">
            <div className="profile-section">
              <div className="profile-label">Anonymous Messages For</div>
              <div className="profile-name">@tiptoe</div>
            </div>
            <div className="prompt-label">They want to know:</div>
            <div className="prompt-text">&ldquo;flowers make all the difference!&rdquo;</div>
            <div className="msg-box">
              <div className="msg-placeholder" ref={placeholderRef}>
                Type your anonymous message...
              </div>
              <div className="msg-typed" ref={typedRef} />
              <div className="char-count" ref={charRef}>0 / 1000</div>
            </div>
            <div className="send-success" ref={successRef}>
              <div className="success-text">
                {"\uD83D\uDD12"} Message sent anonymously. No account needed.
              </div>
            </div>
            <button className="send-btn" ref={sendRef} type="button">
              Send Message
            </button>
            <div className="anon-note">
              {"\uD83D\uDD12"} Completely anonymous. No account needed.
            </div>
            <div className="divider" />
            <div className="reactions-label">Reactions</div>
            <div className="reaction-card" ref={r1Ref}>
              <div className="reaction-text">&ldquo;YES THE TIME IS NOW!&rdquo;</div>
              <div className="reaction-date">Mar 12 &middot; public</div>
            </div>
            <div className="reaction-card" ref={r2Ref}>
              <div className="reaction-text">
                &ldquo;Life is Amazing! Glad You&rsquo;re Apart of Mine!&rdquo;
              </div>
              <div className="reaction-date">Mar 10 &middot; public</div>
            </div>
            <div className="reaction-card" ref={r3Ref}>
              <div className="reaction-text">
                &ldquo;flowers make all the difference!&rdquo;
              </div>
              <div className="reaction-date">Mar 8 &middot; public</div>
            </div>
            <div className="divider" />
            <div className="footer-logo">WhatUPB</div>
            <div className="footer-url">
              whatupb.com &middot; get your link &middot; share publicly
            </div>
            <a className="cta-btn" href="https://whatupb.com">
              Get Your Link &rarr;
            </a>
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" ref={progressRef} />
        </div>
        <div className="step-indicator">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className={`dot${n === 1 ? " active" : ""}`}
              ref={(el) => { dotRefs.current[n - 1] = el; }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
