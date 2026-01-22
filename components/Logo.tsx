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
      <title>Finance App Logo - Coin Check</title>
      <g stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="42" cy="42" r="26"/>
        <path d="M32 42l8 8 18-18"/>
        <path d="M60 62c5 2 10 3 16 3"/>
        <path d="M76 65c-6 0-11-1-16-3"/>
      </g>
    </svg>
  )
}
