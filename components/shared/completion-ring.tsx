import { cn } from "@/lib/utils";

export function CompletionRing({
  value,
  size = 112,
  stroke = 10,
  label,
  caption,
  className,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label: string;
  caption?: string;
  className?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - circumference * value;

  return (
    <div className={cn("inline-flex flex-col items-center gap-3", className)}>
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.12"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#completion-gradient)"
            strokeLinecap="round"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
          <defs>
            <linearGradient id="completion-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#ff6b4a" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-heading text-3xl font-semibold">{Math.round(value * 100)}%</span>
          <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</span>
        </div>
      </div>
      {caption ? <p className="text-center text-sm text-muted-foreground">{caption}</p> : null}
    </div>
  );
}
