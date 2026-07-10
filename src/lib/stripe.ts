import { loadStripe, Stripe } from "@stripe/stripe-js";
import { STRIPE_PUBLISHABLE_KEY } from "./config";

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe() {
  if (!STRIPE_PUBLISHABLE_KEY) return null;
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}
