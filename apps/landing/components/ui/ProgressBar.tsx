import { storageTone, type StorageTone } from "@/lib/format";

const barColors: Record<StorageTone, string> = {
  good: "bg-good",
  warning: "bg-series-3",
  critical: "bg-series-6",
};

export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const tone = storageTone(clamped);

  return (
    <div className="w-full">
      {label ? (
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-secondary">{label}</span>
          <span className="font-medium tabular-nums">{clamped.toFixed(1)}%</span>
        </div>
      ) : null}
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-line/70"
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progreso"}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColors[tone]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
