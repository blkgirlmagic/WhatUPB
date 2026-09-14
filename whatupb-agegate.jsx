import { useState, useEffect } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg: #0a0a0f;
    --surface: rgba(255,255,255,0.04);
    --border: rgba(255,255,255,0.08);
    --accent: #7c6aff;
    --accent2: #ff6a9b;
    --text: #f0eeff;
    --muted: rgba(240,238,255,0.45);
  }

  body { background: var(--bg); }

  .gate-wrap {
    min-height: 100vh;
    background: var(--bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
  }

  /* Atmospheric background */
  .gate-wrap::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 50% at 20% 50%, rgba(124,106,255,0.12) 0%, transparent 70%),
      radial-gradient(ellipse 40% 60% at 80% 30%, rgba(255,106,155,0.08) 0%, transparent 70%),
      radial-gradient(ellipse 50% 40% at 50% 90%, rgba(124,106,255,0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  /* Animated noise grain */
  .gate-wrap::after {
    content: '';
    position: fixed;
    inset: -50%;
    width: 200%;
    height: 200%;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    opacity: 0.4;
    pointer-events: none;
    z-index: 0;
    animation: grain 0.5s steps(1) infinite;
  }

  @keyframes grain {
    0%,100% { transform: translate(0,0); }
    10% { transform: translate(-2%,-3%); }
    20% { transform: translate(3%,1%); }
    30% { transform: translate(-1%,4%); }
    40% { transform: translate(4%,-2%); }
    50% { transform: translate(-3%,3%); }
    60% { transform: translate(1%,-4%); }
    70% { transform: translate(-4%,2%); }
    80% { transform: translate(2%,-1%); }
    90% { transform: translate(-2%,4%); }
  }

  /* Floating message previews */
  .msg-float {
    position: fixed;
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.025);
    backdrop-filter: blur(8px);
    border-radius: 12px;
    padding: 10px 14px;
    font-size: 12px;
    color: var(--muted);
    max-width: 200px;
    line-height: 1.4;
    pointer-events: none;
    z-index: 1;
    filter: blur(2px);
    opacity: 0;
    animation: floatIn 8s ease-in-out infinite;
  }

  .msg-float:nth-child(1) { top: 18%; left: 8%; animation-delay: 0s; }
  .msg-float:nth-child(2) { top: 35%; right: 7%; animation-delay: 2s; }
  .msg-float:nth-child(3) { bottom: 25%; left: 10%; animation-delay: 4s; }
  .msg-float:nth-child(4) { bottom: 20%; right: 9%; animation-delay: 6s; }

  @keyframes floatIn {
    0%, 100% { opacity: 0; transform: translateY(8px); }
    20%, 80% { opacity: 1; transform: translateY(0); }
  }

  .card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 420px;
    margin: 24px;
    animation: cardUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @keyframes cardUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Badge */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(124,106,255,0.15);
    border: 1px solid rgba(124,106,255,0.3);
    border-radius: 100px;
    padding: 5px 12px;
    font-size: 11px;
    font-weight: 500;
    color: #a99dff;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 20px;
    animation: cardUp 0.7s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #7c6aff;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.7); }
  }

  .headline {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(52px, 10vw, 72px);
    line-height: 0.92;
    color: var(--text);
    letter-spacing: 0.01em;
    margin-bottom: 14px;
    animation: cardUp 0.7s 0.15s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .headline span {
    background: linear-gradient(135deg, #7c6aff, #ff6a9b);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtext {
    font-size: 15px;
    color: var(--muted);
    line-height: 1.6;
    margin-bottom: 32px;
    font-weight: 300;
    animation: cardUp 0.7s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  /* Feature pills */
  .features {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 32px;
    animation: cardUp 0.7s 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .feat {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 6px 11px;
    font-size: 12px;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* The gate form */
  .gate-box {
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 28px;
    animation: cardUp 0.7s 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .gate-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 14px;
  }

  /* Single-tap option */
  .tap-btn {
    width: 100%;
    padding: 18px;
    background: linear-gradient(135deg, rgba(124,106,255,0.2), rgba(255,106,155,0.15));
    border: 1px solid rgba(124,106,255,0.35);
    border-radius: 14px;
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    margin-bottom: 12px;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }

  .tap-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(124,106,255,0.3), rgba(255,106,155,0.2));
    opacity: 0;
    transition: opacity 0.2s;
  }

  .tap-btn:hover::before { opacity: 1; }
  .tap-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(124,106,255,0.25); }
  .tap-btn:active { transform: translateY(0); }

  .tap-btn-text {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    color: var(--muted);
    font-size: 11px;
    letter-spacing: 0.05em;
  }

  .divider::before, .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  /* DOB fields */
  .dob-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1.5fr;
    gap: 8px;
    margin-bottom: 16px;
  }

  .dob-select {
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 10px;
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    cursor: pointer;
    transition: border-color 0.2s;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(240,238,255,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 28px;
  }

  .dob-select:focus {
    outline: none;
    border-color: rgba(124,106,255,0.5);
  }

  .dob-select option { background: #1a1a2e; color: var(--text); }

  .verify-btn {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, #7c6aff, #9d6aff);
    border: none;
    border-radius: 12px;
    color: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 14px;
  }

  .verify-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(124,106,255,0.4);
  }

  .verify-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .fine-print {
    font-size: 11px;
    color: var(--muted);
    text-align: center;
    line-height: 1.5;
    opacity: 0.7;
  }

  /* Error state */
  .error-msg {
    background: rgba(255,80,80,0.1);
    border: 1px solid rgba(255,80,80,0.25);
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 13px;
    color: #ff8080;
    margin-bottom: 14px;
    animation: shake 0.4s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    75% { transform: translateX(6px); }
  }

  /* Success state */
  .success-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
    background: var(--bg);
    z-index: 100;
    animation: fadeIn 0.4s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .success-icon {
    width: 64px; height: 64px;
    background: linear-gradient(135deg, #7c6aff, #ff6a9b);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes popIn {
    from { transform: scale(0); }
    to { transform: scale(1); }
  }

  .success-text {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 36px;
    color: var(--text);
    letter-spacing: 0.05em;
  }
`;

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const days = Array.from({length:31}, (_,i) => i+1);
const years = Array.from({length:100}, (_,i) => new Date().getFullYear() - i);

export default function AgeGate() {
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const canSubmit = month && day && year;

  function handleVerify() {
    const dob = new Date(parseInt(year), parseInt(month)-1, parseInt(day));
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    if (age < 18) {
      setError("You must be 18 or older to enter WhatUPB.");
    } else {
      setSuccess(true);
    }
  }

  function handleTap() {
    // Quick confirm tap — still logs age verification
    setSuccess(true);
  }

  if (success) {
    return (
      <>
        <style>{styles}</style>
        <div className="success-overlay">
          <div className="success-icon">✓</div>
          <div className="success-text">Welcome In</div>
          <p style={{color:"rgba(240,238,255,0.5)", fontSize:"14px"}}>Taking you to WhatUPB…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="gate-wrap">
        {/* Blurred floating message previews — hint at the content inside */}
        <div className="msg-float">someone in your circle has thoughts about you 👀</div>
        <div className="msg-float">honestly I think you're the most creative person I know</div>
        <div className="msg-float">can we talk? for real this time</div>
        <div className="msg-float">no name. no filter. just truth.</div>

        <div className="card">
          <div className="badge">
            <div className="badge-dot" />
            Adults only · 18+
          </div>

          <h1 className="headline">
            Say it.<br /><span>Anonymous.</span>
          </h1>

          <p className="subtext">
            WhatUPB is where real talk happens — no names, no judgment. Send and receive honest messages from the people in your world.
          </p>

          <div className="features">
            <div className="feat">👻 100% anonymous</div>
            <div className="feat">🔒 No data sold</div>
            <div className="feat">✨ Real conversations</div>
          </div>

          <div className="gate-box">
            <div className="gate-label">Confirm your age to enter</div>

            {/* Quick single-tap option */}
            <button className="tap-btn" onClick={handleTap}>
              <div className="tap-btn-text">
                <span>✓</span>
                <span>I am 18 or older — Let me in</span>
              </div>
            </button>

            <div className="divider">or enter your date of birth</div>

            {/* DOB fallback */}
            <div className="dob-row">
              <select className="dob-select" value={month} onChange={e => { setMonth(e.target.value); setError(""); }}>
                <option value="">Month</option>
                {months.map((m,i) => <option key={m} value={i+1}>{m}</option>)}
              </select>
              <select className="dob-select" value={day} onChange={e => { setDay(e.target.value); setError(""); }}>
                <option value="">Day</option>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select className="dob-select" value={year} onChange={e => { setYear(e.target.value); setError(""); }}>
                <option value="">Year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button className="verify-btn" onClick={handleVerify} disabled={!canSubmit}>
              Verify & Enter
            </button>

            <p className="fine-print">
              By entering, you confirm you are 18+ and agree to our Terms of Service. This site contains adult content.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
