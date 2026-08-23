import React from 'react';
import { MailIcon } from '../components/Icons';

const formatDate = (value) => value ? new Intl.DateTimeFormat('en-IN', {
  date: 'dd MMM yyyy', hour: '2-digit', minute: '2-digit', hour12: true,
}).format(new Date(value)) : '—';

export default function EmailActivityView({ activities = [], searchQuery = '' }) {
  const query = searchQuery.toLowerCase();
  const rows = activities.filter(activity => [activity.customerName, activity.vehicleNumber, activity.stage, activity.status, activity.recipient]
    .some(value => String(value || '').toLowerCase().includes(query)));

  return (
    <div className="view-wrap">
      <div className="page-heading-row">
        <div>
          <h1 className="page-title">Customer Email Activity</h1>
          <p className="page-subtitle">Every automated lifecycle message, with delivery stage and time.</p>
        </div>
        <div className="status-summary"><MailIcon size={16} /> {rows.length} logged message{rows.length === 1 ? '' : 's'}</div>
      </div>

      <div className="card table-card">
        {rows.length === 0 ? (
          <div className="empty-state">
            <MailIcon size={26} />
            <div className="empty-state-title">No email activity yet</div>
            <div className="empty-state-sub">New customer invites and service-stage emails will appear here after the worker sends them.</div>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Vehicle Number</th><th>Customer</th><th>Stage</th><th>Delivery</th><th>Sent At</th></tr></thead>
              <tbody>{rows.map((activity) => (
                <tr key={activity._id || activity.id}>
                  <td><span className="vehicle-code">{activity.vehicleNumber || '—'}</span></td>
                  <td><strong>{activity.customerName || 'Customer'}</strong><div className="table-muted">{activity.recipient || 'No email address'}</div></td>
                  <td>{activity.stage || 'Automated email'}{activity.detail && <div className="table-muted">{activity.detail}</div>}</td>
                  <td><span className={`badge ${activity.status === 'FAILED' ? 'badge-coral' : 'badge-green'}`}>{activity.status || 'SENT'} · {(activity.channel || 'email').toUpperCase()}</span></td>
                  <td className="table-muted">{formatDate(activity.sentAt || activity.sent_at)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
