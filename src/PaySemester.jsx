import React, { useState } from "react";
import { apiFetch } from "./utils/api";

export default function PaySemester({ studentId, amount = 2000, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/payments/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ studentId, amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create payment");

      // If Stripe Checkout session URL is returned, redirect to it (real Stripe flow)
      if (data.url) {
        window.location.href = data.url;
        return;
      }

      // Otherwise (dev mode), immediately return paymentId so the app can call mock-success and download
      const paymentId = data.paymentId;
      if (!paymentId) throw new Error("No paymentId returned");
      if (onSuccess) onSuccess(paymentId);
    } catch (err) {
      console.error(err);
      setError(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-3">Pay Semester Transport Fee</h2>
      <p className="text-sm text-gray-600 mb-4">
        Amount: ${(amount / 100).toFixed(2)} (covers 6 months)
      </p>
      {error && <div className="text-red-500 text-sm mb-3">{error}</div>}
      <button
        onClick={handlePay}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Processing..." : "Pay Semester"}
      </button>
    </div>
  );
}
