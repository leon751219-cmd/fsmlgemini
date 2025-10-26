"use client"

interface YinYangIconProps {
  className?: string;
}

export function YinYangIcon({ className = "" }: YinYangIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M 50 2 A 24 24 0 0 1 50 50 A 24 24 0 0 0 50 98 A 48 48 0 0 1 50 2"
        fill="currentColor"
        opacity="0.9"
      />
      <circle cx="50" cy="26" r="6" fill="black" />
      <circle cx="50" cy="74" r="6" fill="white" />
    </svg>
  );
}
