import React, { useMemo } from "react";
import { Download } from "lucide-react";

const statusBadge = {
  succeeded: "bg-green-50 text-green-700 border border-green-200",
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  failed: "bg-red-50 text-red-700 border border-red-200",
};

export default function PaymentsAdmin() {

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
          <p className="text-xs uppercase tracking-wide text-gray-500">Total payments</p>
          <p className="text-2xl font-semibold text-gray-900">0</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
          <p className="text-xs uppercase tracking-wide text-gray-500">Completed</p>
          <p className="text-2xl font-semibold text-green-600">0</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
          <p className="text-xs uppercase tracking-wide text-gray-500">Pending</p>
          <p className="text-2xl font-semibold text-amber-600">0</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Student Payments</h2>
          <p className="text-sm text-gray-500">
            Monitor payment status and download cards when needed.
          </p>
        </div>
      
      </div>
    </div>
  );
}


