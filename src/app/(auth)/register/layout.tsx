import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a BetterAds account to start running video ad campaigns.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
