import React, { useEffect, useState } from 'react';
import { CheckIcon, CarIcon, LockIcon, ZapIcon } from '../components/Icons';

const steps = (data) => [
  ['Feedback invitation', Boolean(data?.feedbackStatus), data?.feedbackStatus === 'SUBMITTED'],
  ['Feedback received', Boolean(data?.complaint), Boolean(data?.complaint)],
  ['Invoice uploaded', Boolean(data?.invoice), Boolean(data?.invoice)],
  ['AI audit complete', Boolean(data?.comparison), Boolean(data?.comparison)],
];

export default function PublicTrackingView({ token }) {
  const [data, setData] = useState(null); const [error, setError] = useState(''); const [rating, setRating] = useState(0); const [ratingMessage, setRatingMessage] = useState('');
  useEffect(() => { fetch(`/api/tracking/${token}`).then(r => r.json()).then(d => d.success ? setData(d.data) : setError(d.message || 'Tracking link is invalid')).catch(() => setError('Unable to load tracking status. Please try again.')); }, [token]);
  return <div className="public-feedback-page"><div className="public-feedback-card card" style={{ width: '100%', padding: 0 }}>
    <div style={{ background: 'var(--primary)', color: '#fff', padding: '1rem 1.25rem', display: 'flex', gap: '.65rem', alignItems: 'center' }}><ZapIcon size={18} /><div><strong>AutoAudit AI</strong><div style={{ fontSize: '.74rem', opacity: .75 }}>Vehicle service tracking</div></div></div>
    {error ? <div className="empty-state"><LockIcon size={24} /><div className="empty-state-msg">{error}</div></div> : !data ? <div className="empty-state"><div className="empty-state-msg">Loading your service status…</div></div> : <div style={{ padding: '1.25rem' }}>
      <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem', background: 'var(--primary-soft)' }}><div style={{ display: 'flex', gap: '.65rem', alignItems: 'center' }}><CarIcon size={18} /><div><div className="vehicle-code">{data.vehicleNumber}</div><div className="table-muted">{data.customerName} · {data.serviceCenter}</div></div></div></div>
      <h1 className="page-title" style={{ fontSize: '1.2rem' }}>Service progress</h1><p className="page-subtitle" style={{ marginBottom: '1rem' }}>Your service updates are shown here automatically.</p>
      <div className="history-timeline">{steps(data).map(([label, available, active], index) => <div key={label} style={{ display: 'flex', gap: '.75rem', alignItems: 'center', padding: '.7rem', border: 'var(--border)', background: active ? 'var(--green-bg)' : '#fff' }}><span className={`stat-badge ${available ? 'badge-green' : 'badge-amber'}`}>{available ? <CheckIcon size={12} /> : index + 1}</span><strong style={{ fontSize: '.86rem' }}>{label}</strong><span className="table-muted" style={{ marginLeft: 'auto' }}>{available ? 'Complete' : 'Pending'}</span></div>)}</div>
      {data.comparison?.reportUrl && <a className="btn btn-primary btn-full" style={{ marginTop: '1rem', textDecoration: 'none' }} href={data.comparison.reportUrl} target="_blank" rel="noreferrer">Download Audit Report (PDF)</a>}
      {data.comparison && <div className="card" style={{ marginTop: '1rem', padding: '1rem' }}><strong style={{ fontSize: '.9rem' }}>How was your completed service experience?</strong><p className="table-muted">Your rating helps the service centre improve.</p>{data.complaint?.rating ? <div className="stat-badge badge-green" style={{ marginTop: '.6rem' }}>Thank you — you rated ★ {data.complaint.rating}/5</div> : <><div style={{ display: 'flex', gap: '.4rem', marginTop: '.7rem' }}>{[1,2,3,4,5].map(value => <button key={value} type="button" className={`btn btn-sm ${rating >= value ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setRating(value)}>★</button>)}</div><button className="btn btn-secondary" style={{ marginTop: '.7rem' }} disabled={!rating} onClick={async () => { const response = await fetch(`/api/tracking/${token}/rating`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rating }) }); const result = await response.json(); if (result.success) { setData({ ...data, complaint: { ...data.complaint, rating } }); setRatingMessage('Thank you for your rating.'); } else setRatingMessage(result.message || 'Unable to save rating.'); }}>Submit rating</button>{ratingMessage && <div className="table-muted">{ratingMessage}</div>}</>}</div>}
    </div>}
  </div></div>;
}
