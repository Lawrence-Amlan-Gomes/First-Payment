// src/components/login/Billing.tsx
"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { useTheme } from "@/app/hooks/useTheme";
import { usePrice } from "@/app/hooks/usePrice";
import Link from "next/link";
import { useEffect, useState } from "react";
import { updatePaymentType } from "@/app/actions";
import colors from "@/app/color/color";
import { useRouter } from "next/navigation";

export default function Billing() {
  const { user: auth } = useAuth();
  const { theme } = useTheme();
  const { wantToPaymentType, wantToPaymentDuration } = usePrice();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [priceId, setPriceId] = useState("");

  useEffect(() => {
    if (!auth) router.push("/login");
  }, [auth, router]);

  const paymentString = `${wantToPaymentType} ${wantToPaymentDuration === "annual" ? "Annual" : "Monthly"}`;

  // Map plan to Paddle Price ID (create in Paddle Dashboard)
  const priceMap: Record<string, string> = {
    "Standard Monthly": "pri_std_monthly_123",
    "Standard Annual": "pri_std_annual_456",
    "Premium Monthly": "pri_prem_monthly_789",
    "Premium Annual": "pri_prem_annual_012",
  };

  useEffect(() => {
    setPriceId(priceMap[paymentString] || "");
  }, [paymentString]);

  // Initialize Paddle Inline
  useEffect(() => {
    if (!priceId || typeof window === "undefined") return;

    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.onload = () => {
      // @ts-ignore
      window.Paddle.Environment.set(process.env.NEXT_PUBLIC_PADDLE_ENV!);
      // @ts-ignore
      window.Paddle.Initialize({ token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN! });
    };
    document.body.appendChild(script);

    return () => { document.body.removeChild(script); };
  }, [priceId]);

  const openInlineCheckout = () => {
    if (!window.Paddle || !auth?.email) return;

    setLoading(true);

    // @ts-ignore
    window.Paddle.Checkout.open({
      settings: {
        displayMode: "inline",
        frameTarget: "paddle-frame", // CSS target
        frameInitialHeight: 450,
        theme: theme ? "light" : "dark",
      },
      items: [{ priceId, quantity: 1 }],
      customer: { email: auth.email },
      customData: { userId: auth.email },
    });

    // Listen for success
    const handleSuccess = () => {
      updatePaymentType(auth.email, paymentString);
      alert("Payment successful!");
      router.push("/");
      setLoading(false);
    };

    document.addEventListener("paddle.checkout.completed", handleSuccess);

    return () => {
      document.removeEventListener("paddle.checkout.completed", handleSuccess);
    };
  };

  return (
    <div className={`h-full sm:pt-[10%] w-full flex flex-col items-center justify-center p-4 sm:p-6 ${
      theme ? "bg-[#ffffff] text-[#0a0a0a]" : "bg-[#000000] text-[#ebebeb]"
    }`}>
      <div className="max-w-md w-full">
        <h1 className={`text-2xl sm:text-3xl font-bold mb-4 text-center ${
          theme ? "text-[#0a0a0a]" : "text-[#ebebeb]"
        }`}>
          Pay with Card
        </h1>

        <div className="text-center mb-6">
          <p className="text-lg font-medium">Plan:</p>
          <p className={`text-2xl font-bold ${theme ? "text-[#0a0a0a]" : "text-[#ebebeb]"}`}>
            {paymentString}
          </p>
        </div>

        {/* Paddle Inline Frame */}
        <div id="paddle-frame" className="w-full h-96 border rounded-lg overflow-hidden" />

        <button
          onClick={openInlineCheckout}
          disabled={loading || !priceId}
          className={`w-full mt-4 p-3 rounded-lg font-medium transition-all ${
            loading || !priceId
              ? "bg-gray-400 cursor-not-allowed"
              : `${colors.keyColorBg} text-white hover:bg-blue-800`
          }`}
        >
          {loading ? "Loading..." : "Pay Now"}
        </button>

        <div className="mt-4 text-center">
          <Link href="/payment">
            <button className={`p-3 rounded-lg text-sm font-medium ${
              theme
                ? "bg-gray-200 text-[#0a0a0a] hover:bg-gray-300"
                : "bg-[#222222] text-[#ebebeb] hover:bg-[#2a2a2a]"
            }`}>
              Go Back
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}