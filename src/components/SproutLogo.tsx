import React from 'react';

interface SproutLogoProps {
  className?: string;
  size?: number;
}

export const SproutLogo: React.FC<SproutLogoProps> = ({ className = 'w-7 h-7', size }) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sproutGradPrimary" x1="4" y1="28" x2="28" y2="4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#15803d" />
          <stop offset="0.6" stopColor="#16a34a" />
          <stop offset="1" stopColor="#22c55e" />
        </linearGradient>
        <linearGradient id="sproutGradSecondary" x1="16" y1="20" x2="6" y2="10" gradientUnits="userSpaceOnUse">
          <stop stopColor="#166534" />
          <stop offset="1" stopColor="#4ade80" />
        </linearGradient>
      </defs>

      {/* Gentle fertile seed base / earth mound */}
      <path
        d="M6 28C10 26 22 26 26 28"
        stroke="#78716c"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Main gentle curved stem */}
      <path
        d="M16 27C15.8 21 16.2 16 16.8 12C17.2 9.5 17.5 7 17.5 5"
        stroke="url(#sproutGradPrimary)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Left unfurling leaflet */}
      <path
        d="M16.5 14.5C12.5 14 8 11.5 7.5 7.5C11.5 7 15 10 16.5 14.5Z"
        fill="url(#sproutGradSecondary)"
      />

      {/* Right larger mature leaf */}
      <path
        d="M17 12C20.5 10.5 25.5 8.5 26.5 4.5C22.5 4 18 8 17 12Z"
        fill="url(#sproutGradPrimary)"
      />

      {/* Central leaf vein accent */}
      <path
        d="M18 10.5C21 8.5 23.5 6.5 25 5.5"
        stroke="#bbf7d0"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
};
