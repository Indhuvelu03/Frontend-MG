import React from 'react';
import { CheckIcon, AlertTriangleIcon, MailIcon } from '../components/Icons';

const formatDate = (value) => value ? new Intl.DateTimeFormat('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
}).format(new Date(value)) : 'Time not available';

const stageTitle = (value) => (value || 'Automated email')
  .replaceAll('_', ' ')
  .replace(/\b\w/g, letter => letter.toUpperCase());

export default function EmailActivityView({ activities = [], searchQuery = '' }) {
  const query = searchQuery.toLowerCase();
  const rows = activities.filter(activity => [activity.customerName, activity.vehicleNumber, activity.stage, activity.status, activity.recipient]
    .some(value => String(value || '').toLowerCase().includes(query)));

  const cases = Object.values(rows.reduce((grouped, activity) => {
    const key = `${activity.vehicleNumber || 'unknown'}-${activity.customerName || 'customer'}`;
    if (!grouped[key]) grouped[key] = {
      key,
      vehicleNumber: activity.vehicleNumber || 'Vehicle not recorded',
      customerName: activity.customerName || 'Customer',
      recipient: activity.recipient || 'No email address',
      activities: [],
    };
    grouped[key].activities.push(activity);
    return grouped;
  }, {})).map(caseItem => ({
    ...caseItem,
    activities: [...caseItem.activities].sort((a, b) => new Date(a.sentAt || a.sent_at || 0) - new Date(b.sentAt || b.sent_at || 0)),
  }));

  return (
    <div className="view-wrap">
      <div className="page-heading-row">
        <div>
          <h1 className="page-title">Customer communications</h1>
          <p className="page-subtitle">A complete record of automated updates sent during each service case.</p>
        </div>
        <div className="status-summary"><MailIcon size={16} /> {rows.length} message{rows.length === 1 ? '' : 's'} · {cases.length} case{cases.length === 1 ? '' : 's'}</div>
      </div>

      {cases.length === 0 ? (
        <div className="card"><div className="empty-state"><MailIcon size={26} /><div className="empty-state-title">No communication activity yet</div><div className="empty-state-sub">Feedback invitations and service progress emails will appear here once they are sent.</div></div></div>
      ) : (
        <div className="email-case-list">
          {cases.map(caseItem => {
            const latest = caseItem.activities[caseItem.activities.length - 1];
            const failed = caseItem.activities.some(activity => activity.status === 'FAILED');
            return (
              <section className="email-case-card" key={caseItem.key}>
                <div className="email-case-header">
                  <div className="email-case-avatar">{caseItem.customerName.charAt(0).toUpperCase()}</div>
                  <div className="email-case-person"><div className="email-case-name">{caseItem.customerName}</div><div className="email-case-recipient"><MailIcon size={13} /> {caseItem.recipient}</div></div>
                  <div className="email-case-vehicle">{caseItem.vehicleNumber}</div>
                  <div className={`stat-badge ${failed ? 'badge-coral' : 'badge-green'}`}>{failed ? 'ACTION NEEDED' : 'UPDATES SENT'}</div>
                </div>

                <div className="email-timeline">
                  {caseItem.activities.map((activity, index) => {
                    const isFailed = activity.status === 'FAILED';
                    return (
                      <div className="email-timeline-item" key={activity._id || activity.id || `${caseItem.key}-${index}`}>
                        <div className={`email-timeline-icon ${isFailed ? 'failed' : 'sent'}`}>
                          {isFailed ? <AlertTriangleIcon size={14} /> : <CheckIcon size={14} />}
                        </div>
                        <div className="email-timeline-content">
                          <div className="email-stage-row"><strong>{stageTitle(activity.stage)}</strong><span className={`stat-badge ${isFailed ? 'badge-coral' : 'badge-green'}`}>{isFailed ? 'FAILED' : 'SENT'} · {(activity.channel || 'email').toUpperCase()}</span></div>
                          {activity.detail && <div className="email-stage-detail">{activity.detail}</div>}
                        </div>
                        <time className="email-timeline-time">{formatDate(activity.sentAt || activity.sent_at)}</time>
                      </div>
                    );
                  })}
                </div>

                <div className="email-case-footer">Latest update: <strong>{stageTitle(latest?.stage)}</strong> · {formatDate(latest?.sentAt || latest?.sent_at)}</div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
