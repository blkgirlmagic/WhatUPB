"use client";

import { useEffect, useRef } from "react";

export function DiagonalLines() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const ANGLE = -38 * (Math.PI / 180);
    const SPACING = 76;
    const SPEED = 0.22;
    const LINE_W = 0.65;
    const A_BASE = 0.16;
    const A_BRIGHT = 0.28;
    const brightSet = new Set([2, 7, 13]);

    let offset = 0;
    let raf: number;

    function draw(ts: number) {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      const diag = Math.sqrt(canvas!.width ** 2 + canvas!.height ** 2);
      const cosA = Math.cos(ANGLE);
      const sinA = Math.sin(ANGLE);
      const perp =
        Math.abs(canvas!.width * sinA) + Math.abs(canvas!.height * cosA);
      const count = Math.ceil(perp / SPACING) + 2;
      const start = -Math.ceil(count / 2) * SPACING;

      for (let i = 0; i < count; i++) {
        const d = start + i * SPACING + (offset % SPACING);
        const bright = brightSet.has(i % count);

        const a = bright
          ? A_BRIGHT * (0.65 + 0.35 * Math.sin(ts * 0.0007 + i * 1.3))
          : A_BASE * (0.75 + 0.25 * Math.sin(ts * 0.0004 + i * 0.9));

        const cx = canvas!.width / 2 + d * -sinA;
        const cy = canvas!.height / 2 + d * cosA;

        const x1 = cx - cosA * diag;
        const y1 = cy - sinA * diag;
        const x2 = cx + cosA * diag;
        const y2 = cy + sinA * diag;

        const g = ctx!.createLinearGradient(x1, y1, x2, y2);
        g.addColorStop(0, "rgba(155,142,232,0)");
        g.addColorStop(0.2, `rgba(155,142,232,${a})`);
        g.addColorStop(
          0.5,
          `rgba(155,142,232,${a * (bright ? 1.25 : 1)})`
        );
        g.addColorStop(0.8, `rgba(155,142,232,${a})`);
        g.addColorStop(1, "rgba(155,142,232,0)");

        ctx!.beginPath();
        ctx!.moveTo(x1, y1);
        ctx!.lineTo(x2, y2);
        ctx!.strokeStyle = g;
        ctx!.lineWidth = bright ? LINE_W * 1.7 : LINE_W;
        ctx!.stroke();
      }

      offset += SPEED;
    }

    function loop(ts: number) {
      draw(ts);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
