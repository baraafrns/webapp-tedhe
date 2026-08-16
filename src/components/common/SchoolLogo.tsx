import React from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = 'w-10 h-10',
  size,
  showText = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${showText ? 'flex-row' : ''}`}>
      <svg
        viewBox="0 0 400 480"
        className={className}
        style={size ? { width: size, height: typeof size === 'number' ? size * 1.2 : size } : undefined}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Logo SMK Tri Dharma 2 Bogor"
      >
        <defs>
          <linearGradient id="shieldBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF248" />
            <stop offset="100%" stopColor="#FFDE1A" />
          </linearGradient>
          <linearGradient id="purpleRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1C1874" />
            <stop offset="50%" stopColor="#3F39B6" />
            <stop offset="100%" stopColor="#120E58" />
          </linearGradient>
          <linearGradient id="cylinderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#252084" />
            <stop offset="50%" stopColor="#7E77DC" />
            <stop offset="100%" stopColor="#1E196E" />
          </linearGradient>
          <filter id="shadowFilter" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Left and Right 3D Rolled Cylinders (Pillars) */}
        <g id="pillars">
          {/* Left Pillar */}
          <path
            d="M 58 130 L 76 130 L 68 375 L 42 375 Z"
            fill="url(#cylinderGrad)"
            stroke="#120E58"
            strokeWidth="2.5"
          />
          <ellipse cx="60" cy="130" rx="10" ry="16" fill="#6A62D2" stroke="#120E58" strokeWidth="2" />
          <ellipse cx="56" cy="375" rx="18" ry="24" fill="#1C1874" stroke="#120E58" strokeWidth="3" />
          <ellipse cx="56" cy="375" rx="12" ry="16" fill="#0C0A3C" />

          {/* Right Pillar */}
          <path
            d="M 342 130 L 324 130 L 332 375 L 358 375 Z"
            fill="url(#cylinderGrad)"
            stroke="#120E58"
            strokeWidth="2.5"
          />
          <ellipse cx="340" cy="130" rx="10" ry="16" fill="#6A62D2" stroke="#120E58" strokeWidth="2" />
          <ellipse cx="344" cy="375" rx="18" ry="24" fill="#1C1874" stroke="#120E58" strokeWidth="3" />
          <ellipse cx="344" cy="375" rx="12" ry="16" fill="#0C0A3C" />
        </g>

        {/* Outer Top Purple Roof / Crown */}
        <path
          d="M 68 130 L 200 40 L 332 130 L 305 130 L 200 68 L 95 130 Z"
          fill="url(#purpleRibbon)"
          stroke="#120E58"
          strokeWidth="3"
        />

        {/* Main Yellow Shield Body */}
        <path
          d="M 80 130 
             L 320 130 
             C 320 280 290 365 200 405 
             C 110 365 80 280 80 130 Z"
          fill="url(#shieldBg)"
          stroke="#111111"
          strokeWidth="4"
        />

        {/* Inner Shield Contour */}
        <path
          d="M 92 140 
             L 308 140 
             C 308 270 280 350 200 390 
             C 120 350 92 270 92 140 Z"
          fill="none"
          stroke="#111111"
          strokeWidth="1.5"
          strokeDasharray="4 2"
        />

        {/* SMK Typography */}
        <g id="smkText">
          <text
            x="200"
            y="170"
            textAnchor="middle"
            fontFamily="'Cinzel', 'Times New Roman', serif"
            fontSize="44"
            fontWeight="900"
            fill="#111111"
            letterSpacing="6"
          >
            SMK
          </text>
        </g>

        {/* Left Wreath - Green Paddy (Padi) */}
        <g id="paddyWreath">
          <path
            d="M 120 340 C 100 280 105 210 130 170"
            stroke="#1B6323"
            strokeWidth="3"
            fill="none"
          />
          {/* Leaves */}
          {[
            { cx: 128, cy: 180, r: 16, rot: -30 },
            { cx: 118, cy: 200, r: 18, rot: -40 },
            { cx: 110, cy: 225, r: 19, rot: -45 },
            { cx: 106, cy: 250, r: 20, rot: -50 },
            { cx: 108, cy: 275, r: 20, rot: -40 },
            { cx: 115, cy: 300, r: 19, rot: -30 },
            { cx: 125, cy: 325, r: 18, rot: -15 },
          ].map((leaf, idx) => (
            <ellipse
              key={`leaf-${idx}`}
              cx={leaf.cx}
              cy={leaf.cy}
              rx={leaf.r * 0.45}
              ry={leaf.r}
              transform={`rotate(${leaf.rot} ${leaf.cx} ${leaf.cy})`}
              fill="#2E933C"
              stroke="#0E4815"
              strokeWidth="2"
            />
          ))}
        </g>

        {/* Right Wreath - Cotton (Kapas) */}
        <g id="cottonWreath">
          <path
            d="M 280 340 C 300 280 295 210 270 170"
            stroke="#5C3414"
            strokeWidth="3"
            fill="none"
          />
          {/* Cotton Pods */}
          {[
            { cx: 270, cy: 180 },
            { cx: 280, cy: 205 },
            { cx: 288, cy: 232 },
            { cx: 290, cy: 260 },
            { cx: 286, cy: 288 },
            { cx: 278, cy: 315 },
          ].map((pod, idx) => (
            <g key={`pod-${idx}`}>
              <circle cx={pod.cx} cy={pod.cy} r="12" fill="#FFFFFF" stroke="#5C3414" strokeWidth="2.5" />
              <path
                d={`M ${pod.cx - 10} ${pod.cy} Q ${pod.cx} ${pod.cy - 4} ${pod.cx + 10} ${pod.cy} M ${pod.cx} ${pod.cy - 10} Q ${pod.cx + 4} ${pod.cy} ${pod.cx} ${pod.cy + 10}`}
                stroke="#7A4B22"
                strokeWidth="2"
                fill="none"
              />
              <circle cx={pod.cx} cy={pod.cy} r="4" fill="#7A4B22" />
            </g>
          ))}
        </g>

        {/* Center Open Book */}
        <g id="openBook">
          {/* Book Spine Center */}
          <path
            d="M 200 210 L 200 320"
            stroke="#111111"
            strokeWidth="3.5"
          />

          {/* Left Page */}
          <path
            d="M 200 210 C 180 200 160 202 150 208 L 150 316 C 160 310 180 310 200 320 Z"
            fill="#FFF89A"
            stroke="#111111"
            strokeWidth="3"
          />
          {/* Left Page Lines */}
          <path
            d="M 160 230 C 172 226 186 226 194 232 M 160 250 C 172 246 186 246 194 252 M 160 270 C 172 266 186 266 194 272 M 160 290 C 172 286 186 286 194 292"
            stroke="#8F7800"
            strokeWidth="1.5"
          />

          {/* Right Page */}
          <path
            d="M 200 210 C 220 200 240 202 250 208 L 250 316 C 240 310 220 310 200 320 Z"
            fill="#FFF89A"
            stroke="#111111"
            strokeWidth="3"
          />
          {/* Right Page Lines */}
          <path
            d="M 240 230 C 228 226 214 226 206 232 M 240 250 C 228 246 214 246 206 252 M 240 270 C 228 266 214 266 206 272 M 240 290 C 228 286 214 286 206 292"
            stroke="#8F7800"
            strokeWidth="1.5"
          />
        </g>

        {/* Lower Banner: TRI DHARMA 2 */}
        <g id="ribbonTriDharma">
          <path
            d="M 90 350 Q 200 410 310 350 L 320 380 Q 200 440 80 380 Z"
            fill="#FFFFFF"
            stroke="#111111"
            strokeWidth="2.5"
          />
          {/* Text along path or stylized text */}
          <text
            x="200"
            y="392"
            textAnchor="middle"
            fontFamily="'Cinzel', 'Times New Roman', serif"
            fontSize="26"
            fontWeight="900"
            fill="#111111"
            letterSpacing="4"
          >
            TRI DHARMA 2
          </text>
        </g>

        {/* Bottom Banner: BOGOR */}
        <g id="ribbonBogor">
          {/* Ribbon Ends */}
          <path d="M 120 405 L 140 435 L 120 445 L 150 445 Z" fill="#1C1874" stroke="#120E58" strokeWidth="2" />
          <path d="M 280 405 L 260 435 L 280 445 L 250 445 Z" fill="#1C1874" stroke="#120E58" strokeWidth="2" />

          {/* Main Bogor Blue Box */}
          <path
            d="M 140 405 L 260 405 L 268 450 L 132 450 Z"
            fill="url(#purpleRibbon)"
            stroke="#111111"
            strokeWidth="2.5"
          />
          <text
            x="200"
            y="437"
            textAnchor="middle"
            fontFamily="'Cinzel', 'Times New Roman', serif"
            fontSize="24"
            fontWeight="900"
            fill="#FFFFFF"
            letterSpacing="6"
          >
            BOGOR
          </text>
        </g>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-sm leading-tight text-[#111111] uppercase tracking-wide">
            SMK TRI DHARMA 2
          </span>
          <span className="text-[11px] text-[#767676] font-medium">Kota Bogor</span>
        </div>
      )}
    </div>
  );
};
