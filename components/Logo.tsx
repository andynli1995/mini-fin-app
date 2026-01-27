interface LogoProps {
  className?: string
  size?: number
}

export default function Logo({ className = '', size = 32 }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 96 96"
      fill="none"
      className={className}
      width={size}
      height={size}
    >
      <title>Solo Entrepreneur Toolkit Logo</title>
      {/* Grid of connected squares representing multiple tools */}
      <g fill="currentColor">
        {/* Top row - 3 squares */}
        <rect x="12" y="12" width="20" height="20" rx="3" opacity="0.9"/>
        <rect x="38" y="12" width="20" height="20" rx="3" opacity="0.9"/>
        <rect x="64" y="12" width="20" height="20" rx="3" opacity="0.9"/>
        
        {/* Bottom row - 3 squares */}
        <rect x="12" y="64" width="20" height="20" rx="3" opacity="0.9"/>
        <rect x="38" y="64" width="20" height="20" rx="3" opacity="0.9"/>
        <rect x="64" y="64" width="20" height="20" rx="3" opacity="0.9"/>
        
        {/* Center connecting element */}
        <circle cx="48" cy="48" r="8" opacity="0.7"/>
      </g>
      {/* Connecting lines between squares */}
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4">
        <line x1="32" y1="22" x2="38" y2="22"/>
        <line x1="58" y1="22" x2="64" y2="22"/>
        <line x1="32" y1="74" x2="38" y2="74"/>
        <line x1="58" y1="74" x2="64" y2="74"/>
        <line x1="22" y1="32" x2="22" y2="38"/>
        <line x1="22" y1="58" x2="22" y2="64"/>
        <line x1="74" y1="32" x2="74" y2="38"/>
        <line x1="74" y1="58" x2="74" y2="64"/>
        {/* Diagonal connections to center */}
        <line x1="32" y1="32" x2="40" y2="40"/>
        <line x1="64" y1="32" x2="56" y2="40"/>
        <line x1="32" y1="64" x2="40" y2="56"/>
        <line x1="64" y1="64" x2="56" y2="56"/>
      </g>
    </svg>
  )
}
