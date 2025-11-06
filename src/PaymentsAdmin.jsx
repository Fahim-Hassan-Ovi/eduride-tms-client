import React, { useMemo } from "react";
import { Download } from "lucide-react";

const statusBadge = {
  succeeded: "bg-green-50 text-green-700 border border-green-200",
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  failed: "bg-red-50 text-red-700 border border-red-200",
};

export default function PaymentsAdmin({ payments = [], apiBase }) {
  const grouped = useMemo(() => {
    const byStatus = { succeeded: 0, pending: 0, failed: 0 };
    payments.forEach((p) => {
      if (p.status && byStatus.hasOwnProperty(p.status)) {
        byStatus[p.status] += 1;
      }
    });
    return byStatus;
  }, [payments]);

  const downloadUrl = (p) =>
    p.cardPath
      ? `${apiBase.replace(/\/$/, "")}/${p.cardPath}`
      : `${apiBase.replace(/\/$/, "")}/api/payments/${p._id}/card`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
          <p className="text-xs uppercase tracking-wide text-gray-500">Total payments</p>
          <p className="text-2xl font-semibold text-gray-900">{payments.length}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
          <p className="text-xs uppercase tracking-wide text-gray-500">Completed</p>
          <p className="text-2xl font-semibold text-green-600">{grouped.succeeded}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
          <p className="text-xs uppercase tracking-wide text-gray-500">Pending</p>
          <p className="text-2xl font-semibold text-amber-600">{grouped.pending}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Student Payments</h2>
          <p className="text-sm text-gray-500">
            Monitor payment status and download cards when needed.
          </p>
        </div>
        {payments.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            No payments have been recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Valid Until</th>
                  <th className="px-4 py-3">Card</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => {
                  const student = p.studentId || {};
                  const amountFormatted = (p.amount || 0) / 100;
                  const badgeClass = statusBadge[p.status] || "bg-gray-100 text-gray-700 border border-gray-200";
                  return (
                    <tr key={p._id} className="text-gray-700">
                      <td className="px-4 py-3 whitespace-nowrap font-medium">
                        {student.name || '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {student.email || p.studentEmail || '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        ${amountFormatted.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {p.validUntil ? new Date(p.validUntil).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {p.status === 'succeeded' ? (
                          <a
                            href={downloadUrl(p)}
                            className="inline-flex items-center space-x-1 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="w-4 h-4" />
                            <span>Card</span>
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {p.createdAt ? new Date(p.createdAt).toLocaleString() : '—'}
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


