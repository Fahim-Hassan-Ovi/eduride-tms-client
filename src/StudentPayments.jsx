import React from "react";
import { Download } from "lucide-react";
import PaySemester from "./PaySemester.jsx";

const statusClasses = {
  succeeded: "text-green-600 bg-green-50",
  pending: "text-amber-600 bg-amber-50",
  failed: "text-red-600 bg-red-50",
};

export default function StudentPayments(
) {
  return (
    <div className="space-y-6">
      <PaySemester
        
      />

      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Payment History</h3>
            <p className="text-sm text-gray-500">
              Completed payments stay valid for 6 months from payment date.
            </p>
          </div>
          <span className="text-sm font-medium text-gray-600">
            Total payments: 0
          </span>
        </div>

        
      </div>
    </div>
  );
}


