import React, { useState } from 'react';
import { AlertTriangleIcon, CheckIcon, ShieldIcon } from '../components/Icons';

const decisions = {
  CONFIRMED_ISSUE: 'Confirm billing issue',
  FALSE_POSITIVE: 'Mark as false positive',
  NEEDS_DOCUMENTS: 'Request supporting documents',
  RESOLVED: 'Resolve case',
};

const readable = (value) => (value || 'Pending review').replaceAll('_', ' ');

export default function ManagerReviewView({ cases = [], onReview }) {
  const [notes, setNotes] = useState({});
  const [status, setStatus] = useState({});

  return (
    <div className="view-wrap">
      <div className="page-heading-row">
        <div><h1 className="page-title">Manager review queue</h1><p className="page-subtitle">Resolve audit mismatches and delayed service cases with a documented decision.</p></div>
        <span className="status-summary"><ShieldIcon size={16} /> {cases.length} case{cases.length === 1 ? '' : 's'} awaiting review</span>
      </div>

      {cases.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">✓</div><div className="empty-state-msg">No cases need manager review</div><div className="empty-state-sub">High-risk audits, mismatches, and SLA delays will appear here automatically.</div></div></div>
      ) : <div className="manager-review-list">
        {cases.map(item => {
          const complaint = item.complaint || {};
          const comparison = item.comparison;
          const id = complaint.id || complaint._id;
          const currentDecision = status[id] || comparison?.reviewStatus || 'UNREVIEWED';
          const currentNotes = notes[id] ?? comparison?.reviewNotes ?? '';
          const flagged = item.slaDelayed || comparison?.status === 'MISMATCH' || Number(comparison?.score) < 60;
          const evidence = [
            ...(comparison?.missingIssues || []).map(text => ({ type: 'Missing customer request', text })),
            ...(comparison?.extraInvoiceItems || []).map(text => ({ type: 'Unexplained invoice item', text })),
          ];
          return <section className="manager-review-card" key={id}>
            <header className="manager-review-header">
              <div className={`manager-risk-icon ${flagged ? 'risk' : 'watch'}`}>{flagged ? <AlertTriangleIcon size={18} /> : <ShieldIcon size={18} />}</div>
              <div><div className="vehicle-code">{complaint.vehicleNumber || complaint.vehicle_number || 'Vehicle pending'}</div><div className="manager-case-customer">{item.customer?.name || 'Customer'} · {item.customer?.serviceCenter || item.customer?.service_center || 'Service center'}</div></div>
              <div className="manager-review-metrics"><span className={`stat-badge ${item.slaDelayed ? 'badge-coral' : flagged ? 'badge-amber' : 'badge-green'}`}>{item.slaDelayed ? `SLA DELAY · ${item.ageMinutes} MIN` : readable(comparison?.status)}</span>{comparison && <strong className="manager-score">{Math.round(Number(comparison.score) || 0)}<small>%</small></strong>}</div>
            </header>

            <div className="manager-review-body">
              <div className="manager-evidence"><div className="manager-section-label">AI assessment</div><p>{comparison?.summary || 'This service case has exceeded the review time limit and needs a manager decision.'}</p>{evidence.length > 0 && <div className="manager-evidence-list">{evidence.map((entry, index) => <div className="manager-evidence-row" key={`${entry.type}-${index}`}><span className={`stat-badge ${entry.type.startsWith('Missing') ? 'badge-coral' : 'badge-amber'}`}>{entry.type}</span><span>{entry.text}</span></div>)}</div>}</div>
              <div className="manager-feedback"><div className="manager-section-label">Customer feedback</div><p>“{complaint.transcript || 'Transcript is not available yet.'}”</p></div>
            </div>

            <div className="manager-decision-panel">
              <div className="form-group"><label className="form-label" htmlFor={`decision-${id}`}>Decision</label><select id={`decision-${id}`} className="form-select" value={currentDecision} onChange={event => setStatus({ ...status, [id]: event.target.value })}><option value="UNREVIEWED" disabled>Choose a decision</option>{Object.entries(decisions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
              <div className="form-group manager-notes"><label className="form-label" htmlFor={`notes-${id}`}>Manager notes</label><textarea id={`notes-${id}`} className="form-input" value={currentNotes} onChange={event => setNotes({ ...notes, [id]: event.target.value })} placeholder="State the decision, next action, or evidence requested…" /></div>
              <button className="btn btn-primary" disabled={currentDecision === 'UNREVIEWED'} onClick={() => onReview(id, currentDecision, currentNotes)}><CheckIcon size={14} /> Save decision</button>
            </div>
          </section>;
        })}
      </div>}
    </div>
  );
}
