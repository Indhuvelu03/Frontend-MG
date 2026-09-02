import React, { useState } from 'react';
import { CpuIcon, ZapIcon, PlusIcon, AlertTriangleIcon } from '../components/Icons';

function ConfidenceBar({ value, tone = 'green' }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  const color = tone === 'coral' ? 'var(--coral)' : tone === 'amber' ? 'var(--amber)' : 'var(--green)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <div style={{ flex: 1, height: '6px', background: '#f1f5f9', overflow: 'hidden' }}>
        <div style={{ width: `${safeValue}%`, height: '100%', background: color, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: '0.78rem', fontWeight: 800, color, minWidth: '34px' }}>{safeValue}%</span>
    </div>
  );
}

const statusTone = (status) => status === 'FULL_MATCH' ? 'badge-green' : status === 'PARTIAL_MATCH' ? 'badge-amber' : 'badge-coral';
const humanStatus = (status) => (status || 'PROCESSING').replaceAll('_', ' ');

export default function ComparisonView({ complaints = [], getCustName, selectedComplaintId, onUploadInvoice }) {
  const [selectedId, setSelectedId] = useState(selectedComplaintId || complaints[0]?._id || '');
  const activeComplaint = complaints.find(c => c._id === selectedId) || complaints[0];
  const pdfReportUrl = activeComplaint?.aiComparison?.reportUrl || "#";

  if (!activeComplaint) {
    return <div><div className="page-header"><div><h1 className="page-title">AI Semantic Audit Engine</h1><p className="page-subtitle">Compare customer feedback against every invoice line item.</p></div><button className="btn btn-primary" onClick={onUploadInvoice}><PlusIcon size={14} /> Upload Invoice PDF</button></div><div className="card"><div className="empty-state"><CpuIcon size={28} /><div className="empty-state-title">No audit cases available</div><div className="empty-state-sub">Upload an invoice after the customer submits feedback to start an audit.</div></div></div></div>;
  }

  const audit = activeComplaint.aiComparison;
  const matchedItems = audit?.matchedItems || [];
  const missingIssues = audit?.missingIssues || [];
  const extraItems = audit?.extraInvoiceItems || [];
  const score = audit?.matchPercentage ?? 0;
  const rows = [
    ...matchedItems.map(item => ({ type: 'match', complaint: item.complaintIssue, invoice: item.invoiceItem, confidence: item.confidence })),
    ...missingIssues.map(issue => ({ type: 'missing', complaint: issue, invoice: 'Not found on invoice', confidence: 0 })),
    ...extraItems.map(item => ({ type: 'extra', complaint: 'No matching customer request', invoice: item, confidence: 0 })),
  ];
  const customerName = getCustName ? getCustName(activeComplaint.customerId) : 'Customer';
  const hasAudit = Boolean(audit);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">AI Semantic Audit Engine</h1><p className="page-subtitle">Evidence-based comparison of customer feedback and invoice line items.</p></div>
        <div className="page-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select className="form-select" style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.85rem', fontWeight: 700 }} value={activeComplaint._id} onChange={event => setSelectedId(event.target.value)}>
            {complaints.map(complaint => <option key={complaint._id} value={complaint._id}>{complaint.vehicleNumber} — {getCustName ? getCustName(complaint.customerId) : 'Customer'}</option>)}
          </select>
          <a
            href={pdfReportUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
            download={`audit_report_${activeComplaint.vehicleNumber}.pdf`}
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            📥 Download PDF
          </a>
          <button className="btn btn-primary" onClick={onUploadInvoice}><PlusIcon size={14} /> Upload Invoice</button>
        </div>
      </div>

      {!hasAudit ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}><CpuIcon size={28} /><h2 style={{ fontSize: '1rem', margin: '.75rem 0 .35rem' }}>Audit is being prepared</h2><p className="page-subtitle">The customer feedback and invoice are saved. OCR/transcription and AI comparison will appear here automatically when complete.</p></div>
      ) : <>
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="stat-card accent-green"><div className="stat-icon green"><ZapIcon size={16} /></div><div className="stat-label">Audit match score</div><div className="stat-value-row"><span className="stat-value">{score}%</span><span className={`stat-badge ${statusTone(audit.conclusion)}`}>{humanStatus(audit.conclusion)}</span></div><div className="stat-trend-label">Weighted evidence match</div></div>
          <div className="stat-card accent-blue"><div className="stat-icon blue"><CpuIcon size={16} /></div><div className="stat-label">Verified invoice items</div><div className="stat-value-row"><span className="stat-value">{matchedItems.length}</span><span className="stat-badge badge-green">MATCHED</span></div><div className="stat-trend-label">Directly supported by feedback</div></div>
          <div className="stat-card accent-amber"><div className="stat-icon amber"><AlertTriangleIcon size={16} /></div><div className="stat-label">Items needing review</div><div className="stat-value-row"><span className="stat-value">{missingIssues.length + extraItems.length}</span><span className={`stat-badge ${missingIssues.length + extraItems.length ? 'badge-amber' : 'badge-green'}`}>{missingIssues.length + extraItems.length ? 'REVIEW' : 'CLEAR'}</span></div><div className="stat-trend-label">Missing requests or unexplained billing</div></div>
        </div>

        <div className="card">
          <div className="card-header"><div><h3 className="card-title"><CpuIcon size={15} /> Audit evidence — <span style={{ fontFamily: 'monospace', background: 'var(--primary-soft)', padding: '.1rem .45rem' }}>{activeComplaint.vehicleNumber}</span></h3><span className="card-subtitle">Customer: {customerName} · {humanStatus(audit.conclusion)}</span></div><span className={`stat-badge ${statusTone(audit.conclusion)}`}>{score}% MATCH</span></div>
          <div className="transcript-block"><div className="transcript-label">Customer feedback used for this audit</div><p className="transcript-quote">“{activeComplaint.transcript || 'Feedback is being transcribed.'}”</p></div>
          <div className="table-container"><table className="custom-table"><thead><tr><th>#</th><th>Customer request</th><th>Invoice line item</th><th>Evidence</th><th>Verdict</th></tr></thead><tbody>
            {rows.map((row, index) => {
              const verdict = row.type === 'match' ? 'VERIFIED' : row.type === 'missing' ? 'NOT BILLED' : 'REVIEW';
              const badge = row.type === 'match' ? 'badge-green' : row.type === 'missing' ? 'badge-coral' : 'badge-amber';
              return <tr key={`${row.type}-${index}`}><td style={{ color: 'var(--text-subtle)' }}>{index + 1}</td><td style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>{row.complaint}</td><td><strong>{row.invoice}</strong></td><td style={{ minWidth: '145px' }}><ConfidenceBar value={row.confidence} tone={row.type === 'match' ? 'green' : row.type === 'missing' ? 'coral' : 'amber'} /></td><td><span className={`stat-badge ${badge}`}>{verdict}</span></td></tr>;
            })}
          </tbody></table></div>
          <div style={{ marginTop: '1.25rem', padding: '1rem 1.1rem', background: audit.conclusion === 'FULL_MATCH' ? 'var(--green-bg)' : 'var(--amber-bg)', border: `1px solid ${audit.conclusion === 'FULL_MATCH' ? 'var(--green-border)' : 'var(--amber-border)'}`, display: 'flex', gap: '.65rem' }}><div style={{ flexShrink: 0 }}><ZapIcon size={18} /></div><div><div style={{ fontSize: '.85rem', fontWeight: 800 }}>AI conclusion: {humanStatus(audit.conclusion)}</div><div style={{ fontSize: '.82rem', lineHeight: 1.6, marginTop: '.2rem' }}>{audit.analysis || 'The audit completed without a written summary.'}</div></div></div>
        </div>
      </>}
    </div>
  );
}
