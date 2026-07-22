import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your BetterAds account to manage campaigns, ads, and sites.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
