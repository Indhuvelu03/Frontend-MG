import React, { useMemo, useState } from 'react';
import { MailIcon, SearchIcon, CheckCircleIcon, AlertTriangleIcon, CarIcon } from '../components/Icons';

const formatDate = (value) => value ? new Intl.DateTimeFormat('en-IN', {
  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true,
}).format(new Date(value)) : '—';

const palette = {
  DELIVERED: ['#ECFDF5', '#047857', '#A7F3D0'],
  READ: ['#ECFDF5', '#047857', '#A7F3D0'],
  SENT: ['#EFF6FF', '#1D4ED8', '#BFDBFE'],
  QUEUED: ['#FFF7ED', '#C2410C', '#FED7AA'],
  ACCEPTED: ['#FFF7ED', '#C2410C', '#FED7AA'],
  FAILED: ['#FEF2F2', '#DC2626', '#FECACA'],
  UNDELIVERED: ['#FEF2F2', '#DC2626', '#FECACA'],
};

const displayStatus = (activity) => String(activity.providerStatus || activity.status || 'UNKNOWN').toUpperCase();
const displayChannel = (channel) => channel === 'whatsapp' ? 'WhatsApp' : channel === 'sms' ? 'SMS' : channel === 'email' ? 'Email' : channel || 'System';

const Metric = ({ label, value, tone = '#18181B' }) => (
  <div style={{ background: '#fff', border: '1px solid #E4E4E7', borderRadius: 8, padding: '1rem 1.15rem' }}>
    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    <div style={{ marginTop: 5, fontSize: '1.6rem', fontWeight: 800, color: tone }}>{value}</div>
  </div>
);

export default function EmailActivityView({ activities = [], searchQuery = '' }) {
  const [localSearch, setLocalSearch] = useState('');
  const query = (searchQuery || localSearch).toLowerCase().trim();
  const rows = useMemo(() => activities.filter((activity) => [
    activity.customerName,
    activity.vehicleNumber,
    activity.stage,
    activity.status,
    activity.providerStatus,
    activity.channel,
    activity.recipient,
  ].some((value) => String(value || '').toLowerCase().includes(query))), [activities, query]);

  const delivered = activities.filter((item) => ['DELIVERED', 'READ'].includes(displayStatus(item))).length;
  const inProgress = activities.filter((item) => ['QUEUED', 'ACCEPTED', 'SENT'].includes(displayStatus(item))).length;
  const failed = activities.filter((item) => ['FAILED', 'UNDELIVERED'].includes(displayStatus(item))).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Communications</h1>
          <p className="page-subtitle">Independent WhatsApp, SMS and email automation attempts with live provider delivery status.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <Metric label="Total attempts" value={activities.length} />
        <Metric label="Delivered / read" value={delivered} tone="#047857" />
        <Metric label="Queued / sent" value={inProgress} tone="#1D4ED8" />
        <Metric label="Failed" value={failed} tone="#DC2626" />
      </div>

      <div style={{ background: '#fff', border: '1px solid #E4E4E7', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #E4E4E7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Delivery timeline <span style={{ color: '#A1A1AA', fontWeight: 500 }}>({rows.length})</span></div>
          <div style={{ position: 'relative', width: 290 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#A1A1AA', display: 'flex' }}><SearchIcon size={14} /></span>
            <input value={localSearch} onChange={(event) => setLocalSearch(event.target.value)} placeholder="Search customer, vehicle or channel" style={{ width: '100%', padding: '7px 10px 7px 32px', border: '1px solid #E4E4E7', borderRadius: 6, background: '#FAFAFA', fontSize: '0.8rem' }} />
          </div>
        </div>

        {rows.length === 0 ? (
          <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#71717A' }}>
            <MailIcon size={34} />
            <div style={{ marginTop: 10, fontWeight: 700, color: '#18181B' }}>No communication activity found</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table" style={{ minWidth: 1040 }}>
              <thead><tr><th>#</th><th>Customer</th><th>Vehicle</th><th>Stage</th><th>Channel</th><th>Recipient</th><th>Delivery</th><th>Time</th></tr></thead>
              <tbody>
                {rows.map((activity, index) => {
                  const status = displayStatus(activity);
                  const [background, color, border] = palette[status] || ['#F4F4F5', '#52525B', '#D4D4D8'];
                  const failure = ['FAILED', 'UNDELIVERED'].includes(status);
                  return (
                    <tr key={activity.id || activity._id || `${activity.stage}-${index}`}>
                      <td style={{ color: '#A1A1AA' }}>{index + 1}</td>
                      <td><div style={{ fontWeight: 700 }}>{activity.customerName || 'Customer'}</div></td>
                      <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 700, fontSize: '0.75rem' }}><CarIcon size={12} />{activity.vehicleNumber || '—'}</span></td>
                      <td><div style={{ fontWeight: 650 }}>{activity.stage || 'Notification'}</div>{activity.detail && <div style={{ color: failure ? '#DC2626' : '#71717A', fontSize: '0.72rem', marginTop: 2, maxWidth: 260 }}>{activity.detail}</div>}</td>
                      <td><span style={{ fontWeight: 700, fontSize: '0.75rem' }}>{displayChannel(activity.channel)}</span></td>
                      <td style={{ color: '#52525B', fontSize: '0.78rem' }}>{activity.recipient || '—'}</td>
                      <td><span style={{ background, color, border: `1px solid ${border}`, borderRadius: 4, padding: '0.18rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 750, fontSize: '0.68rem' }}>{failure ? <AlertTriangleIcon size={11} /> : <CheckCircleIcon size={11} />}{status}</span></td>
                      <td style={{ whiteSpace: 'nowrap', color: '#71717A', fontSize: '0.75rem' }}>{formatDate(activity.deliveredAt || activity.sentAt || activity.sent_at)}</td>
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
