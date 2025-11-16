import React, { useEffect, useState } from 'react';
import { apiFetch } from './utils/api';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

function triggerDownloadFromUrl(path, filename) {
  const cleanBase = API_BASE.replace(/\/$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  const url = `${cleanBase}/${cleanPath}`;
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function triggerDownloadFromResponse(res, filename) {
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export default function PaymentSuccess({ paymentId, onDone }) {
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState('');

  useEffect(() => {
    // support two modes:
    // - dev: paymentId provided (mock-success flow)
    // - stripe: no paymentId, URL contains ?session_id=... and we lookup payment by session
    const getSessionFromQuery = () => {
      const params = new URLSearchParams(window.location.search);
      return params.get('session_id');
    };

    if (!paymentId) {
      const session = getSessionFromQuery();
      if (!session) return;
      // poll backend for payment linked to this session (webhook should mark it)
      const poll = async () => {
        setStatus('polling');
        try {
          for (let i = 0; i < 20; i++) {
            const r = await apiFetch(`/api/payments/session/${session}`);
            if (r.ok) {
              const j = await r.json();
              if (j.status === 'succeeded') {
                if (j.cardPath) {
                  // fetch the stored card as blob to force a download instead of navigating the page
                  const cardRes = await apiFetch(`/${j.cardPath}`);
                  if (!cardRes.ok) throw new Error('failed to download card');
                  await triggerDownloadFromResponse(cardRes, `transport-card-${j._id}.pdf`);
                } else {
                  const d = await apiFetch(`/api/payments/${j._id}/card`);
                  if (!d.ok) throw new Error('failed to download card');
                  await triggerDownloadFromResponse(d, `transport-card-${j._id}.pdf`);
                }
                setStatus('done');
                if (onDone) onDone();
                return;
              }
            }
            await new Promise(r => setTimeout(r, 1500));
          }
          throw new Error('Timed out waiting for payment to be confirmed.');
        } catch (err) {
          console.error(err);
          setError(err.message || 'Payment check failed');
          setStatus('error');
        }
      };
      poll();
      return;
    }

    const doSuccessAndDownload = async () => {
      try {
        setStatus('marking');
        // mark success via mock endpoint (dev only)
        const sRes = await apiFetch('/api/payments/mock-success', { method: 'POST', body: JSON.stringify({ paymentId }) });
        const sJson = await sRes.json();
        if (!sRes.ok) throw new Error(sJson.error || 'mock-success failed');

        setStatus('downloading');
        if (sJson.payment?.cardPath) {
          const cardRes = await apiFetch(`/${sJson.payment.cardPath}`);
          if (!cardRes.ok) {
            const txt = await cardRes.text();
            throw new Error(txt || 'failed to fetch stored PDF');
          }
          await triggerDownloadFromResponse(cardRes, `transport-card-${paymentId}.pdf`);
        } else {
          const r = await apiFetch(`/api/payments/${paymentId}/card`);
          if (!r.ok) {
            const txt = await r.text();
            throw new Error(txt || 'failed to fetch PDF');
          }
          await triggerDownloadFromResponse(r, `transport-card-${paymentId}.pdf`);
        }
        setStatus('done');
        if (onDone) onDone();
      } catch (err) {
        console.error(err);
        setError(err.message || 'Payment success handling failed');
        setStatus('error');
      }
    };

    doSuccessAndDownload();
  }, [paymentId]);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-3">Payment Result</h2>
      {status === 'processing' && <p>Preparing...</p>}
      {status === 'marking' && <p>Marking payment as succeeded...</p>}
      {status === 'downloading' && <p>Downloading transport card...</p>}
      {status === 'done' && <p className="text-green-600">Done. The PDF should be downloading.</p>}
      {status === 'error' && <p className="text-red-600">Error: {error}</p>}
    </div>
  );
}


