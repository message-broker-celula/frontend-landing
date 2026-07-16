export function Spinner({
  className = "h-5 w-5",
  label = "Cargando",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block animate-spin rounded-full border-2 border-line border-t-accent ${className}`}
    />
  );
}
