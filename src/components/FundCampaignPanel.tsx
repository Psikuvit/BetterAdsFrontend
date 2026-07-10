"use client";

import { useState } from "react";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getStripe } from "@/lib/stripe";
import { errorMessage } from "@/lib/errors";
import * as campaignsApi from "@/lib/api/campaigns";
import { ApiError } from "@/lib/types";

function CardPaymentForm({
  clientSecret,
  amount,
  onDone,
}: {
  clientSecret: string;
  amount: string;
  onDone: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");

  async function handlePay(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!stripe || !elements) return;
    const card = elements.getElement(CardElement);
    if (!card) return;

    setStatus("processing");
    setError("");

    const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed");
      setStatus("idle");
      return;
    }

    if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
      setStatus("done");
    } else {
      setError("Payment did not complete");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Payment submitted. Budget updates aren&apos;t pushed instantly — refresh to check.
        </p>
        <Button variant="secondary" onClick={onDone}>
          Refresh campaign
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handlePay} className="flex flex-col gap-4">
      <div className="rounded-md border border-input bg-card px-3 py-2.5 transition-all duration-200 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
        <CardElement
          options={{
            style: {
              base: { fontSize: "14px", color: "inherit" },
            },
          }}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="submit" loading={status === "processing"} disabled={!stripe}>
        Pay ${amount}
      </Button>
    </form>
  );
}

export function FundCampaignPanel({
  campaignId,
  onFunded,
}: {
  campaignId: number;
  onFunded: () => void;
}) {
  const stripePromise = getStripe();
  const [amount, setAmount] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleStart(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await campaignsApi.fundCampaign(campaignId, Number(amount));
      setClientSecret(res.clientSecret);
    } catch (err) {
      if (err instanceof ApiError && err.status === 502) {
        setError("Payments aren't configured on the server right now.");
      } else {
        setError(errorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }

  if (!stripePromise) {
    return (
      <p className="text-sm text-muted-foreground">
        Stripe isn&apos;t configured for this app (missing publishable key).
      </p>
    );
  }

  if (clientSecret) {
    return (
      <Elements stripe={stripePromise}>
        <CardPaymentForm clientSecret={clientSecret} amount={amount} onDone={onFunded} />
      </Elements>
    );
  }

  return (
    <form onSubmit={handleStart} className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Input
          label="Amount (USD)"
          type="number"
          min="0.01"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="50.00"
        />
      </div>
      <Button type="submit" loading={loading}>
        Continue
      </Button>
      {error && <p className="text-xs text-destructive sm:ml-2">{error}</p>}
    </form>
  );
}
