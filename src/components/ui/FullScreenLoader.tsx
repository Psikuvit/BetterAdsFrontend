export function FullScreenLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <div className="relative">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 dark:border-white/15 border-t-electric-blue" />
        <span
          className="absolute inset-0 h-10 w-10 animate-spin rounded-full border-2 border-transparent border-t-electric-blue/50"
          style={{ animationDuration: "1.5s" }}
        />
      </div>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 animate-pulse">{label}</p>
    </div>
  );
}
