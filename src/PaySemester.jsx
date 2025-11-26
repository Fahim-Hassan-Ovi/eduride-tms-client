import React from "react";

export default function PaySemester({ amount = 2000 }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-3">Pay Semester Transport Fee</h2>
      <p className="text-sm text-gray-600 mb-4">
        Amount: ${(amount / 100).toFixed(2)} (covers 6 months)
      </p>

      <button
        onClick={() => {}}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Pay Semester
      </button>
    </div>
  );
}
