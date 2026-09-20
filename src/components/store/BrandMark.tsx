export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="classic-tile" x1="7" y1="5" x2="57" y2="61" gradientUnits="userSpaceOnUse"><stop stopColor="#A82049"/><stop offset="1" stopColor="#641027"/></linearGradient>
        <linearGradient id="classic-light" x1="17" y1="29" x2="48" y2="49" gradientUnits="userSpaceOnUse"><stop stopColor="#FFFFFF"/><stop offset="1" stopColor="#E5E5E5"/></linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="17" fill="url(#classic-tile)"/>
      <path d="M14 27 32 11l18 16-9 9-9-8-9 8-9-9Z" fill="#4A0C1D" opacity=".82"/>
      <path d="m14 33 9-9 9 9 9-9 9 9-18 18-18-18Z" fill="url(#classic-light)"/>
      <path d="m23 32 9-9 9 9-9 9-9-9Z" fill="#111318"/>
      <path d="m18 34 14 14 14-14" stroke="#D8A1B1" strokeWidth="1.4" strokeLinecap="round" opacity=".5"/>
      <circle cx="50" cy="14" r="3.2" fill="#FFFFFF"/>
    </svg>
  );
}
