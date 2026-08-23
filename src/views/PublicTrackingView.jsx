import React, { useEffect, useState } from 'react';
import { CheckIcon, CarIcon, LockIcon, ZapIcon } from '../components/Icons';

const steps = (data) => [
  ['Feedback invitation', Boolean(data?.feedbackStatus), data?.feedbackStatus === 'SUBMITTED'],
  ['Feedback received', Boolean(data?.complaint), Boolean(data?.complaint)],
  ['Invoice uploaded', Boolean(data?.invoice), Boolean(data?.invoice)],
  ['AI audit complete', Boolean(data?.comparison), Boolean(data?.comparison)],
];

export default function PublicTrackingView({ token }) {
  const [data, setData] = useState(null); const [error, setError] = useState('');
  useEffect(() => { fetch(`/api/public/tracking/${token}`).then(r => r.json()).then(d => d.success ? setData(d.data) : setError(d.message || 'Tracking link is invalid')).catch(() => setError('Unable to load tracking status. Please try again.')); }, [token]);
  return <div className="public-feedback-page"><div className="public-feedback-card card" style={{ width: '100%', padding: 0 }}>
    <div style={{ background: 'var(--primary)', color: '#fff', padding: '1rem 1.25rem', display: 'flex', gap: '.65rem', alignItems: 'center' }}><ZapIcon size={18} /><div><strong>AutoAudit AI</strong><div style={{ fontSize: '.74rem', opacity: .75 }}>Vehicle service tracking</div></div></div>
    {error ? <div className="empty-state"><LockIcon size={24} /><div className="empty-state-msg">{error}</div></div> : !data ? <div className="empty-state"><div className="empty-state-msg">Loading your service status…</div></div> : <div style={{ padding: '1.25rem' }}>
      <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem', background: 'var(--primary-soft)' }}><div style={{ display: 'flex', gap: '.65rem', alignItems: 'center' }}><CarIcon size={18} /><div><div className="vehicle-code">{data.vehicleNumber}</div><div className="table-muted">{data.customerName} · {data.serviceCenter}</div></div></div></div>
      <h1 className="page-title" style={{ fontSize: '1.2rem' }}>Service progress</h1><p className="page-subtitle" style={{ marginBottom: '1rem' }}>Your service updates are shown here automatically.</p>
      <div className="history-timeline">{steps(data).map(([label, available, active], index) => <div key={label} style={{ display: 'flex', gap: '.75rem', alignItems: 'center', padding: '.7rem', border: 'var(--border)', background: active ? 'var(--green-bg)' : '#fff' }}><span className={`stat-badge ${available ? 'badge-green' : 'badge-amber'}`}>{available ? <CheckIcon size={12} /> : index + 1}</span><strong style={{ fontSize: '.86rem' }}>{label}</strong><span className="table-muted" style={{ marginLeft: 'auto' }}>{available ? 'Complete' : 'Pending'}</span></div>)}</div>
      {data.comparison?.reportUrl && <a className="btn btn-primary btn-full" style={{ marginTop: '1rem', textDecoration: 'none' }} href={data.comparison.reportUrl} target="_blank" rel="noreferrer">Download Audit Report (PDF)</a>}
    </div>}
  </div></div>;
}
