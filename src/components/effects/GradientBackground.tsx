// Static CSS gradient background (no animation loop — GPU/battery friendly).
export default function GradientBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0"
      style={{
        backgroundColor: "#050507",
        backgroundImage: `
          radial-gradient(ellipse 80% 60% at 15% 20%, rgba(79, 70, 229, 0.22), transparent 60%),
          radial-gradient(ellipse 70% 55% at 85% 30%, rgba(147, 51, 234, 0.16), transparent 60%),
          radial-gradient(ellipse 90% 70% at 50% 100%, rgba(6, 182, 212, 0.10), transparent 65%),
          radial-gradient(ellipse 120% 90% at 50% 50%, rgba(5, 5, 7, 0) 40%, rgba(5, 5, 7, 0.7) 100%)
        `,
      }}
    />
  );
}
