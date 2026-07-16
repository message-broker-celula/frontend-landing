import type { ReactNode } from "react";

type AlertTone = "error" | "success" | "info" | "warning";

const toneClasses: Record<AlertTone, string> = {
  error: "border-series-6/30 bg-series-6/10 text-series-6",
  success: "border-good/30 bg-good/10 text-good",
  info: "border-accent/30 bg-accent-soft text-accent",
  warning: "border-series-3/30 bg-series-3/10 text-series-3",
};

export function Alert({
  tone = "info",
  title,
  children,
  action,
}: {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col gap-3 rounded-2xl border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between ${toneClasses[tone]}`}
    >
      <div>
        {title ? <p className="font-medium">{title}</p> : null}
        <div className={title ? "mt-1 opacity-90" : undefined}>{children}</div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
