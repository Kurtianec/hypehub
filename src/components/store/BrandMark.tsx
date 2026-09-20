export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="hypehub-mark-bg" x1="8" y1="4" x2="58" y2="61" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5149E8" />
          <stop offset=".56" stopColor="#6C63F4" />
          <stop offset="1" stopColor="#28C9C0" />
        </linearGradient>
        <linearGradient id="hypehub-mark-line" x1="17" y1="18" x2="48" y2="47" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="#DFFFFB" />
        </linearGradient>
      </defs>
      <path d="M5 17C5 9.82 10.82 4 18 4h28c7.18 0 13 5.82 13 13v30c0 7.18-5.82 13-13 13H18C10.82 60 5 54.18 5 47V17Z" fill="url(#hypehub-mark-bg)"/>
      <path d="M18 19v26M46 19v26" stroke="url(#hypehub-mark-line)" strokeWidth="7" strokeLinecap="round"/>
      <path d="M20 32h24" stroke="white" strokeWidth="7" strokeLinecap="round"/>
      <path d="m24 23 8-5 8 5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity=".34"/>
      <circle cx="50" cy="14" r="3" fill="#9EFFF5"/>
    </svg>
  );
}
