import { useState } from 'react';

export default function FinanceDashboard() {
  const mockPayments = [
    { id: 'P-001', student: 'Alice', amount: 120.00, paid: true },
    { id: 'P-002', student: 'Bob', amount: 120.00, paid: false },
    { id: 'P-003', student: 'Clara', amount: 120.00, paid: true },
  ];

  const [payments, setPayments] = useState(mockPayments);
  const totalCollected = payments.filter(p => p.paid).reduce((s, p) => s + p.amount, 0);
  const totalStudentsPaid = payments.filter(p => p.paid).length;
  const [receipt, setReceipt] = useState(null);

  const triggerPayment = (studentId) => {
    // mock payment flow
    const updated = payments.map(p => p.id === studentId ? { ...p, paid: true } : p);
    setPayments(updated);
    setReceipt({ id: `R-${Date.now()}`, student: payments.find(p => p.id === studentId).student, amount: payments.find(p => p.id === studentId).amount });
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Finance & Payments</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{totalStudentsPaid}</p>
          <p className="text-sm text-gray-600">Total Students Paid</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">${totalCollected.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Total Amount Collected</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{payments.length}</p>
          <p className="text-sm text-gray-600">Total Transactions</p>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Student</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-2">{p.id}</td>
                <td className="px-4 py-2">{p.student}</td>
                <td className="px-4 py-2">${p.amount.toFixed(2)}</td>
                <td className="px-4 py-2">{p.paid ? <span className="text-green-600">Paid</span> : <span className="text-red-600">Pending</span>}</td>
                <td className="px-4 py-2 text-right">
                  {!p.paid && <button onClick={() => triggerPayment(p.id)} className="px-3 py-1 bg-blue-600 text-white rounded">Pay</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {receipt && (
        <div className="mt-6 p-4 bg-white rounded shadow">
          <h3 className="font-semibold">Payment Receipt (Mock)</h3>
          <p className="text-sm text-gray-600">Receipt ID: {receipt.id}</p>
          <p className="text-sm">Student: {receipt.student}</p>
          <p className="text-sm">Amount: ${receipt.amount.toFixed(2)}</p>
          <div className="mt-3">
            <button onClick={() => window.print()} className="px-3 py-1 bg-gray-800 text-white rounded">Print Receipt</button>
            <button onClick={() => setReceipt(null)} className="ml-2 px-3 py-1 bg-gray-100">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}


