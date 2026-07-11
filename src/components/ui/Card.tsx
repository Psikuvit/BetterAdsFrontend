export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  // Only apply the default padding when the caller doesn't set its own p-* class
  const padding = /(^|\s)p-\d/.test(className) ? "" : "p-5";
  return (
    <div
      className={`glass rounded-2xl ${padding} transition-all duration-300 ease-smooth hover:glass-hover animate-fade-up ${className}`}
    >
      {children}
    </div>
  );
}
