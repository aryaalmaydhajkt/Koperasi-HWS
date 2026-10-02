import React from 'react';

interface HwsLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const HwsLogo: React.FC<HwsLogoProps> = ({ className = 'w-12 h-12', size = 64 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="Logo Koperasi Himpunan Wirausaha Sejahtera"
    >
      <defs>
        {/* Curved path for text */}
        <path
          id="textCurveHWS"
          d="M 30,120 A 74,74 0 0,0 170,120"
        />
        <linearGradient id="roofGrad" x1="100" y1="20" x2="100" y2="105" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ef4444" />
          <stop offset="1" stopColor="#b91c1c" />
        </linearGradient>
        <linearGradient id="hwsBlue" x1="100" y1="50" x2="100" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="0.3" stopColor="#0284c7" />
          <stop offset="1" stopColor="#1e40af" />
        </linearGradient>
        <linearGradient id="wheatGrad" x1="100" y1="70" x2="100" y2="135" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fef08a" />
          <stop offset="0.5" stopColor="#eab308" />
          <stop offset="1" stopColor="#ca8a04" />
        </linearGradient>
      </defs>

      {/* Yellow Circular Base */}
      <circle cx="100" cy="100" r="94" fill="#FACC15" stroke="#EAB308" strokeWidth="2.5" />

      {/* House Chimney (Green) */}
      <rect x="44" y="55" width="16" height="38" rx="2" fill="#16A34A" />

      {/* House Roof (Red Triangle Chevron) */}
      <path
        d="M 100,24 L 172,92 L 158,100 L 100,46 L 42,100 L 28,92 Z"
        fill="url(#roofGrad)"
      />

      {/* Golden Wheat / Rice Laurel Wreath */}
      <g fill="url(#wheatGrad)">
        {/* Left Laurel */}
        <path d="M 64,88 C 60,94 62,106 70,114 C 73,118 78,122 84,125 C 77,121 73,113 72,105 C 71,97 66,91 64,88 Z" opacity="0.9" />
        <ellipse cx="68" cy="82" rx="4.5" ry="9" transform="rotate(-30 68 82)" />
        <ellipse cx="61" cy="94" rx="4.5" ry="9" transform="rotate(-45 61 94)" />
        <ellipse cx="62" cy="107" rx="4.5" ry="9" transform="rotate(-65 62 107)" />
        <ellipse cx="71" cy="118" rx="4.5" ry="8.5" transform="rotate(-75 71 118)" />
        <ellipse cx="84" cy="125" rx="4" ry="7.5" transform="rotate(-85 84 125)" />

        {/* Right Laurel */}
        <ellipse cx="132" cy="82" rx="4.5" ry="9" transform="rotate(30 132 82)" />
        <ellipse cx="139" cy="94" rx="4.5" ry="9" transform="rotate(45 139 94)" />
        <ellipse cx="138" cy="107" rx="4.5" ry="9" transform="rotate(65 138 107)" />
        <ellipse cx="129" cy="118" rx="4.5" ry="8.5" transform="rotate(75 129 118)" />
        <ellipse cx="116" cy="125" rx="4" ry="7.5" transform="rotate(85 116 125)" />
      </g>

      {/* 3D HWS Monogram / Shield in Center */}
      <g transform="translate(68, 52)">
        {/* Hexagonal / 3D Shield Outline */}
        <path
          d="M 32,0 L 58,16 L 58,46 L 32,64 L 6,46 L 6,16 Z"
          fill="url(#hwsBlue)"
          stroke="#0369a1"
          strokeWidth="1.5"
        />
        {/* 3D facets */}
        <path d="M 32,0 L 58,16 L 32,28 L 6,16 Z" fill="#38bdf8" opacity="0.8" />
        {/* Stylized 'HWS' Lettering inside hexagon */}
        <text
          x="32"
          y="42"
          textAnchor="middle"
          fill="#FFFFFF"
          fontWeight="900"
          fontSize="23"
          letterSpacing="0.5"
          fontFamily="system-ui, -apple-system, sans-serif"
          filter="drop-shadow(0 2px 3px rgba(0,0,0,0.5))"
        >
          HWS
        </text>
      </g>

      {/* Green Cupped Hands at Base */}
      {/* Left Hand */}
      <path
        d="M 50,102 C 50,118 64,136 82,142 C 92,145 96,145 96,145 C 96,145 88,138 78,132 C 67,126 62,116 62,106 C 62,99 53,95 50,102 Z"
        fill="#22C55E"
      />
      <path
        d="M 55,116 C 64,128 78,136 93,141 C 82,136 71,126 66,112 Z"
        fill="#16A34A"
      />

      {/* Right Hand */}
      <path
        d="M 150,102 C 150,118 136,136 118,142 C 108,145 104,145 104,145 C 104,145 112,138 122,132 C 133,126 138,116 138,106 C 138,99 147,95 150,102 Z"
        fill="#22C55E"
      />
      <path
        d="M 145,116 C 136,128 122,136 107,141 C 118,136 129,126 134,112 Z"
        fill="#16A34A"
      />

      {/* Circular Bottom Text: HIMPUNAN WIRAUSAHA SEJAHTERA */}
      <text fill="#B91C1C" fontSize="10.5" fontWeight="900" letterSpacing="2.8" fontFamily="Georgia, serif">
        <textPath href="#textCurveHWS" startOffset="50%" textAnchor="middle">
          HIMPUNAN WIRAUSAHA SEJAHTERA
        </textPath>
      </text>
    </svg>
  );
};
