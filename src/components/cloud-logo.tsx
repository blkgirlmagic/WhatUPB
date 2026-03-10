interface CloudLogoProps {
  width?: number;
  height?: number;
  className?: string;
  /** Show the drop shadow beneath the cloud (used for hero mascot) */
  showShadow?: boolean;
  /** Show extra highlight ellipses on left/right bumps (used for hero mascot) */
  showExtraHighlights?: boolean;
}

export function CloudLogo({
  width = 28,
  height = 36,
  className,
  showShadow = false,
  showExtraHighlights = false,
}: CloudLogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 88 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {showShadow && (
        <ellipse cx="44" cy="70" rx="26" ry="3.5" fill="rgba(155,142,232,0.15)" />
      )}
      {/* Cloud body base */}
      <rect x="8" y="33" width="72" height="34" rx="17" fill="#B5A8F0" />
      {/* Left bump */}
      <circle cx="22" cy="33" r="16" fill="#B5A8F0" />
      {/* Centre bump — tallest */}
      <circle cx="44" cy="20" r="21" fill="#C4BBF5" />
      {/* Right bump */}
      <circle cx="66" cy="31" r="15" fill="#B5A8F0" />
      {/* Top highlight on centre bump */}
      <ellipse cx="44" cy="13" rx="11" ry="7" fill="rgba(255,255,255,0.30)" />
      {showExtraHighlights && (
        <>
          {/* Left bump highlight */}
          <ellipse cx="19" cy="24" rx="7" ry="4.5" fill="rgba(255,255,255,0.18)" />
          {/* Right bump highlight */}
          <ellipse cx="67" cy="24" rx="6" ry="4" fill="rgba(255,255,255,0.14)" />
        </>
      )}
      {/* Eyes */}
      <circle cx="34" cy="46" r="6.5" fill="white" />
      <circle cx="54" cy="46" r="6.5" fill="white" />
      {/* Pupils */}
      <circle cx="35" cy="47" r="3.8" fill="#3D2E8C" />
      <circle cx="55" cy="47" r="3.8" fill="#3D2E8C" />
      {/* Eye shine */}
      <circle cx="37" cy="45" r="1.4" fill="white" />
      <circle cx="57" cy="45" r="1.4" fill="white" />
      {/* Smile */}
      <path
        d="M30 57 Q44 67 58 57"
        stroke="#3D2E8C"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      {/* Rosy cheeks */}
      <ellipse cx="24" cy="55" rx="5.5" ry="3.5" fill="rgba(244,114,182,0.30)" />
      <ellipse cx="64" cy="55" rx="5.5" ry="3.5" fill="rgba(244,114,182,0.30)" />
    </svg>
  );
}
