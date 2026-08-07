import React from 'react';

export type LogoVariant = 'full' | 'symbol' | 'monochrome' | 'inverse';
export type LogoSize = 'sm' | 'md' | 'lg';

export interface GiaDinhViVuLogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  showText?: boolean;
}

/**
 * GiaDinhViVuLogo Component
 * Premium SVG vector logo for "Gia Đình Vi Vu"
 * 
 * Brand Colors:
 * - Deep Forest Green: #183B35
 * - Mid Forest Green: #28584E
 * - Light Forest Green: #5F7F75
 * - Sunset Orange: #D9943D
 * - Text Color: #1D211F
 */
export const GiaDinhViVuLogo: React.FC<GiaDinhViVuLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  showText,
  ...props
}) => {
  // Height map for standard sizes (sm: 24px, md: 36px, lg: 56px)
  const sizeHeightMap: Record<LogoSize, number> = {
    sm: 24,
    md: 36,
    lg: 56,
  };

  const h = sizeHeightMap[size] || 36;
  const isSymbolOnly = variant === 'symbol' || showText === false;

  // Palette calculation according to variant
  let cTop = '#183B35';
  let cMid = '#28584E';
  let cOrange = '#D9943D';
  let cBase = '#28584E';
  let textColor = '#1D211F';

  if (variant === 'monochrome') {
    cTop = '#183B35';
    cMid = '#183B35';
    cOrange = '#183B35';
    cBase = '#183B35';
    textColor = '#183B35';
  } else if (variant === 'inverse') {
    cTop = '#FFFFFF';
    cMid = '#FFFFFF';
    cOrange = '#FFFFFF';
    cBase = '#FFFFFF';
    textColor = '#FFFFFF';
  }

  // 1. Symbol-only version
  if (isSymbolOnly) {
    return (
      <svg
        height={h}
        width={h}
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Biểu tượng Gia Đình Vi Vu"
        role="img"
        className={`inline-block shrink-0 transition-opacity ${className}`}
        {...props}
      >
        <title>Biểu tượng Gia Đình Vi Vu</title>
        {/* Top Roof / Canopy Layer 1 */}
        <path
          d="M 4 23.5 C 10 19, 23 8, 30.5 8 C 37 8, 45.5 15.5, 47.5 21 C 41.5 18, 32 15.5, 23.5 21 C 16.5 25.5, 8.5 25.5, 4 23.5 Z"
          fill={cTop}
        />
        {/* Upper Middle Terrain Ribbon */}
        <path
          d="M 8.5 31 C 15.5 26, 28 21, 46 25.5 C 41 28.5, 34 31, 26.5 36 C 20 40.5, 12.5 38.5, 8.5 31 Z"
          fill={cMid}
        />
        {/* Forward Sunset Orange Road / Beam */}
        <path
          d="M 18 48.5 C 15 44, 18.5 36.5, 25 31.5 C 31 27, 39.5 24.5, 45 26.5 C 39 31, 29.5 37.5, 22.5 49 C 20.5 50.5, 19 50, 18 48.5 Z"
          fill={cOrange}
        />
        {/* Bottom Right Shield Base */}
        <path
          d="M 25.5 50.5 C 32 40, 42.5 31, 47.5 30 C 49 34.5, 47 42.5, 39.5 47.5 C 34 51.5, 28 52, 25.5 50.5 Z"
          fill={cBase}
        />
      </svg>
    );
  }

  // 2. Full Horizontal Logo (Symbol + Wordmark)
  // Aspect ratio 200:56 => width = Math.round((200 / 56) * h)
  const w = Math.round((200 / 56) * h);

  return (
    <svg
      height={h}
      width={w}
      viewBox="0 0 200 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logo Gia Đình Vi Vu"
      role="img"
      className={`inline-block shrink-0 transition-opacity ${className}`}
      {...props}
    >
      <title>Logo Gia Đình Vi Vu</title>

      {/* Abstract Symbol (56x56) */}
      <g id="symbol">
        {/* Top Roof / Canopy Layer 1 */}
        <path
          d="M 4 23.5 C 10 19, 23 8, 30.5 8 C 37 8, 45.5 15.5, 47.5 21 C 41.5 18, 32 15.5, 23.5 21 C 16.5 25.5, 8.5 25.5, 4 23.5 Z"
          fill={cTop}
        />
        {/* Upper Middle Terrain Ribbon */}
        <path
          d="M 8.5 31 C 15.5 26, 28 21, 46 25.5 C 41 28.5, 34 31, 26.5 36 C 20 40.5, 12.5 38.5, 8.5 31 Z"
          fill={cMid}
        />
        {/* Forward Sunset Orange Road / Beam */}
        <path
          d="M 18 48.5 C 15 44, 18.5 36.5, 25 31.5 C 31 27, 39.5 24.5, 45 26.5 C 39 31, 29.5 37.5, 22.5 49 C 20.5 50.5, 19 50, 18 48.5 Z"
          fill={cOrange}
        />
        {/* Bottom Right Shield Base */}
        <path
          d="M 25.5 50.5 C 32 40, 42.5 31, 47.5 30 C 49 34.5, 47 42.5, 39.5 47.5 C 34 51.5, 28 52, 25.5 50.5 Z"
          fill={cBase}
        />
      </g>

      {/* Wordmark (2 lines: Gia Đình / Vi Vu) */}
      <g id="wordmark">
        <text
          x="72"
          y="23"
          fill={textColor}
          fontFamily="'Be Vietnam Pro', 'Inter', system-ui, -apple-system, sans-serif"
          fontWeight="600"
          fontSize="21"
          letterSpacing="-0.01em"
        >
          Gia Đình
        </text>
        <text
          x="72"
          y="45"
          fill={textColor}
          fontFamily="'Be Vietnam Pro', 'Inter', system-ui, -apple-system, sans-serif"
          fontWeight="600"
          fontSize="21"
          letterSpacing="-0.01em"
        >
          Vi Vu
        </text>
      </g>
    </svg>
  );
};

export default GiaDinhViVuLogo;
