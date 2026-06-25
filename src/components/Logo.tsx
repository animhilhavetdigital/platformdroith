export default function Logo({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 260 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Toit */}
      <path
        d="M18 38 L32 18 L46 38"
        fill="#10b981"
        stroke="#10b981"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Murs maison */}
      <rect x="21" y="38" width="22" height="18" fill="#10b981" rx="1" />
      {/* Porte */}
      <rect x="28" y="45" width="8" height="11" fill="white" rx="1" />
      {/* Colonne gauche */}
      <rect x="10" y="40" width="5" height="16" rx="2.5" fill="#059669" />
      {/* Colonne droite */}
      <rect x="49" y="40" width="5" height="16" rx="2.5" fill="#059669" />

      {/* DroitHabitat */}
      <text
        x="68"
        y="32"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="20"
        fontWeight="700"
        fill="#0f172a"
      >
        DroitHabitat
      </text>
      {/* Expertise */}
      <text
        x="68"
        y="52"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="14"
        fontWeight="500"
        fill="#10b981"
      >
        Expertise
      </text>
    </svg>
  );
}
