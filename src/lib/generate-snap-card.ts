import QRCode from "qrcode";

/**
 * Generates a 1080x1920 Snapchat story card PNG as a Blob.
 * Runs entirely client-side using the Canvas API.
 */
export async function generateSnapCard(username: string): Promise<Blob> {
  const W = 1080;
  const H = 1920;
  const link = `whatupb.com/${username}`;
  const fullUrl = `https://whatupb.com/${username}`;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // --- Background: dark gradient ---
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#0a0a0a");
  grad.addColorStop(0.5, "#1a0a2e");
  grad.addColorStop(1, "#0a0a0a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // --- Subtle noise/grain dots for texture ---
  ctx.globalAlpha = 0.03;
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    ctx.fillStyle = "#fff";
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;

  // --- Decorative glow circle behind QR area ---
  const glowGrad = ctx.createRadialGradient(W / 2, 820, 50, W / 2, 820, 350);
  glowGrad.addColorStop(0, "rgba(106, 90, 205, 0.25)");
  glowGrad.addColorStop(0.5, "rgba(106, 90, 205, 0.08)");
  glowGrad.addColorStop(1, "rgba(106, 90, 205, 0)");
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 400, W, 900);

  // --- Fire emoji top ---
  ctx.font = "80px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("\u{1F525}\u{1F525}\u{1F525}", W / 2, 200);

  // --- Main heading with glow ---
  ctx.shadowColor = "#6A5ACD";
  ctx.shadowBlur = 40;
  ctx.font = "bold 72px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Send anonymous", W / 2, 340);
  ctx.fillText("msgs \u{1F440}", W / 2, 430);
  ctx.shadowBlur = 0;

  // --- QR Code ---
  const qrSize = 360;
  const qrDataUrl = await QRCode.toDataURL(fullUrl, {
    width: qrSize,
    margin: 2,
    color: { dark: "#ffffff", light: "#00000000" },
    errorCorrectionLevel: "M",
  });

  const qrImg = await loadImage(qrDataUrl);

  // QR border/frame
  const qrX = (W - qrSize - 40) / 2;
  const qrY = 530;
  ctx.strokeStyle = "rgba(106, 90, 205, 0.6)";
  ctx.lineWidth = 3;
  roundRect(ctx, qrX - 5, qrY - 5, qrSize + 50, qrSize + 50, 20);
  ctx.stroke();

  // QR background
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  roundRect(ctx, qrX, qrY, qrSize + 40, qrSize + 40, 16);
  ctx.fill();

  ctx.drawImage(qrImg, (W - qrSize) / 2, qrY + 20, qrSize, qrSize);

  // --- "Scan me" label ---
  ctx.font = "bold 32px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.fillText("SCAN ME", W / 2, qrY + qrSize + 90);

  // --- Link display with pill background ---
  const linkY = 1100;
  const pillW = 640;
  const pillH = 80;
  const pillX = (W - pillW) / 2;

  ctx.fillStyle = "rgba(106, 90, 205, 0.3)";
  roundRect(ctx, pillX, linkY - 50, pillW, pillH, 40);
  ctx.fill();

  ctx.strokeStyle = "rgba(106, 90, 205, 0.6)";
  ctx.lineWidth = 2;
  roundRect(ctx, pillX, linkY - 50, pillW, pillH, 40);
  ctx.stroke();

  ctx.font = "bold 40px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(link, W / 2, linkY);

  // --- WhatUPB branding ---
  ctx.shadowColor = "#6A5ACD";
  ctx.shadowBlur = 20;
  ctx.font = "bold 56px system-ui, sans-serif";
  ctx.fillStyle = "#6A5ACD";
  ctx.fillText("WhatUPB", W / 2, 1280);
  ctx.shadowBlur = 0;

  // --- Tagline ---
  ctx.font = "36px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.fillText("anonymous real talk \u{1F4AC}", W / 2, 1350);

  // --- Swipe up arrow ---
  drawSwipeUpArrow(ctx, W / 2, 1520);

  ctx.font = "bold 28px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.fillText("SWIPE UP", W / 2, 1610);

  // --- Eye emojis bottom ---
  ctx.font = "60px sans-serif";
  ctx.fillText("\u{1F440}  \u{1F525}  \u{1F440}", W / 2, 1750);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to generate image"));
      },
      "image/png",
      1.0
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawSwipeUpArrow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number
) {
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Arrow shaft
  ctx.beginPath();
  ctx.moveTo(cx, cy + 40);
  ctx.lineTo(cx, cy - 20);
  ctx.stroke();

  // Arrow head
  ctx.beginPath();
  ctx.moveTo(cx - 20, cy);
  ctx.lineTo(cx, cy - 20);
  ctx.lineTo(cx + 20, cy);
  ctx.stroke();

  ctx.restore();
}
