import "flag-icons/css/flag-icons.min.css";

const countries = [
  { code: "ke", name: "Kenya" },
  { code: "ug", name: "Uganda" },
  { code: "tz", name: "Tanzania" },
  { code: "zm", name: "Zambia" },
  { code: "gh", name: "Ghana" },
  { code: "mw", name: "Malawi" },
  { code: "bw", name: "Botswana" },
  { code: "cm", name: "Cameroon" },
  { code: "ng", name: "Nigeria" },
];

type TopBarProps = {
  onlineCount?: number; // pill is hidden when no real number is passed
};

export default function TopBar({ onlineCount }: TopBarProps) {
  return (
    <div className="flex items-center gap-4 border-b border-brand-100 bg-white px-4 py-2">
      {onlineCount !== undefined && (
        <div className="flex shrink-0 items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-900 ring-1 ring-brand-100">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          {onlineCount.toLocaleString()} online
        </div>
      )}

      {/* Scrolling countries */}
      <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-marquee gap-8 hover:[animation-play-state:paused] motion-reduce:animate-none">
          {[...countries, ...countries].map((c, i) => (
            <span
              key={`${c.code}-${i}`}
              className="flex items-center gap-2 whitespace-nowrap text-sm font-medium text-brand-900"
            >
              <span className={`fi fi-${c.code} rounded-sm`} />
              {c.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}