import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset the password for your BetterAds account.",
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
