/** Formatting helpers shared by metrics and dashboard views. */

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-ES").format(value);
}

export function formatPercent(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB"] as const;
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function storageUsagePercent(usedBytes: number, maxBytes: number): number {
  if (maxBytes <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, (usedBytes / maxBytes) * 100));
}

export type StorageTone = "good" | "warning" | "critical";

export function storageTone(percent: number): StorageTone {
  if (percent >= 90) {
    return "critical";
  }
  if (percent >= 75) {
    return "warning";
  }
  return "good";
}
