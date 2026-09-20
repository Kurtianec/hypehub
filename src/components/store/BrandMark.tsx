export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="classic-tile" x1="7" y1="5" x2="57" y2="61" gradientUnits="userSpaceOnUse"><stop stopColor="#776DFF"/><stop offset="1" stopColor="#6674F7"/></linearGradient>
        <linearGradient id="classic-cyan" x1="17" y1="29" x2="48" y2="49" gradientUnits="userSpaceOnUse"><stop stopColor="#7AFFF1"/><stop offset="1" stopColor="#24C9C1"/></linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="17" fill="url(#classic-tile)"/>
      <path d="m14 28 18-17 18 17-9 9-9-9-9 9-9-9Z" fill="#5B52DB" opacity=".78"/>
      <path d="m14 33 9-9 9 9 9-9 9 9-18 18-18-18Z" fill="url(#classic-cyan)"/>
      <path d="m23 28 9-9 9 9-9 9-9-9Z" fill="#17203B"/>
      <path d="m18 34 14 14 14-14" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity=".22"/>
      <circle cx="50" cy="14" r="3.2" fill="#9DFFF3"/>
    </svg>
  );
}
