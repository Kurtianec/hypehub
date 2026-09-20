export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="hypehub-facet-a" x1="11" y1="11" x2="51" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5149E8" /><stop offset="1" stopColor="#8A64F7" />
        </linearGradient>
        <linearGradient id="hypehub-facet-b" x1="19" y1="49" x2="53" y2="13" gradientUnits="userSpaceOnUse">
          <stop stopColor="#23C7C1" /><stop offset="1" stopColor="#91FFF1" />
        </linearGradient>
        <filter id="hypehub-shadow" x="3" y="5" width="58" height="57" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="2.5"/></filter>
      </defs>
      <path d="M32 9 55 32 32 55 9 32 32 9Z" fill="#5149E8" opacity=".22" filter="url(#hypehub-shadow)"/>
      <path d="M31.8 7 55 30.2 46.6 38.6 31.8 23.8 17 38.6 8.6 30.2 31.8 7Z" fill="url(#hypehub-facet-a)"/>
      <path d="m46.6 25.4 8.4 8.4L31.8 57 8.6 33.8l8.4-8.4 14.8 14.8 14.8-14.8Z" fill="url(#hypehub-facet-b)"/>
      <path d="m31.8 23.8 7.9 7.9-7.9 8.5-7.9-8.5 7.9-7.9Z" fill="#171D31"/>
      <path d="m17 38.6 14.8 14.8 14.8-14.8" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity=".34"/>
      <circle cx="52.5" cy="13" r="3.5" fill="#9DFFF2"/>
      <circle cx="11.5" cy="51" r="2" fill="#716BF1" opacity=".65"/>
    </svg>
  );
}
