export default function CrystalLogo({ size = 80 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0 0 18px rgba(79, 70, 229, 0.45))" }}
    >
      <defs>
        <linearGradient
          id="crystal-a"
          x1="20"
          y1="10"
          x2="80"
          y2="90"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4F46E5" />
          <stop offset="1" stopColor="#9333EA" />
        </linearGradient>
        <linearGradient
          id="crystal-b"
          x1="50"
          y1="5"
          x2="50"
          y2="55"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#06B6D4" stopOpacity="0.9" />
          <stop offset="1" stopColor="#4F46E5" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient
          id="crystal-c"
          x1="50"
          y1="45"
          x2="50"
          y2="95"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9333EA" stopOpacity="0.85" />
          <stop offset="1" stopColor="#4F46E5" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      <polygon
        points="50,4 88,28 88,72 50,96 12,72 12,28"
        fill="url(#crystal-a)"
        opacity="0.35"
      />

      <polygon points="50,4 88,28 50,50" fill="url(#crystal-b)" opacity="0.9" />
      <polygon
        points="50,4 12,28 50,50"
        fill="url(#crystal-b)"
        opacity="0.55"
      />
      <polygon
        points="88,28 88,72 50,50"
        fill="url(#crystal-a)"
        opacity="0.7"
      />
      <polygon
        points="12,28 12,72 50,50"
        fill="url(#crystal-a)"
        opacity="0.45"
      />
      <polygon
        points="88,72 50,96 50,50"
        fill="url(#crystal-c)"
        opacity="0.8"
      />
      <polygon
        points="12,72 50,96 50,50"
        fill="url(#crystal-c)"
        opacity="0.5"
      />

      <polygon
        points="50,4 88,28 88,72 50,96 12,72 12,28"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M50 4 L50 50 M12 28 L50 50 L88 28 M12 72 L50 50 L88 72 M50 96 L50 50"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="0.75"
      />

      <polygon points="50,4 88,28 50,50" fill="white" opacity="0.12" />
    </svg>
  );
}
