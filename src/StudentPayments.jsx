import React from "react";
import { Download } from "lucide-react";
import PaySemester from "./PaySemester.jsx";

const statusClasses = {
  succeeded: "text-green-600 bg-green-50",
  pending: "text-amber-600 bg-amber-50",
  failed: "text-red-600 bg-red-50",
};

export default function StudentPayments({
  studentId,
  payments = [],
  onStartPayment,
  apiBase,
  amount = 2000,
}) {
  const sorted = [...payments].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  return (
    <div className="space-y-6">
      <PaySemester
        studentId={studentId}
        amount={amount}
        onSuccess={onStartPayment}
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
            Total payments: {sorted.length}
          </span>
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-sm">
              You haven&apos;t made any semester payments yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Valid Until</th>
                  <th className="px-4 py-3">Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sorted.map((p) => {
                  const statusClass = statusClasses[p.status] || "text-gray-600 bg-gray-100";
                  const amountFormatted = (p.amount || 0) / 100;
                  const downloadUrl = p.cardPath
                    ? `${apiBase.replace(/\/$/, "")}/${p.cardPath}`
                    : `${apiBase.replace(/\/$/, "")}/api/payments/${p._id}/card`;

                  return (
                    <tr key={p._id} className="text-gray-700">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {p.createdAt ? new Date(p.createdAt).toLocaleString() : "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">
                        ${amountFormatted.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
                          {p.status || "unknown"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {p.validUntil ? new Date(p.validUntil).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {p.status === "succeeded" ? (
                          <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">Not available</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


