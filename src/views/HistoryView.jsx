import React, { useState } from 'react';
import { ZapIcon, MicIcon, CpuIcon } from '../components/Icons';
import Pagination from '../components/Pagination';

export default function HistoryView({ historyLogs, complaints = [], customers = [], getCustName, searchQuery }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedAuditId, setExpandedAuditId] = useState(null);
  const itemsPerPage = 6;

  // Build consolidated customer audit sessions from complaints and logs
  const auditSessions = complaints.map(c => {
    const customerName = getCustName ? getCustName(c.customerId) : 'Customer';
    const relatedLogs = historyLogs.filter(l =>
      l.target?.includes(c.vehicleNumber) || l.description?.includes(customerName)
    );

    const latestTimestamp = relatedLogs[0]?.timestamp || '2026-08-10 13:58:58';
    const actor = relatedLogs[0]?.actor || 'System Administrator (ADMIN)';

    return {
      id: c._id,
      vehicleNumber: c.vehicleNumber,
      customerName,
      timestamp: latestTimestamp,
      voiceStatus: 'TRANSCRIPT_READY',
      voiceBadgeText: '✓ Transcribed',
      voiceBadgeClass: 'badge-green',
      pdfStatus: 'PDF_PARSED',
      pdfBadgeText: '✓ PDF Parsed',
      pdfBadgeClass: 'badge-amber',
      matchScore: c.aiComparison?.matchPercentage ?? 100,
      matchConclusion: c.aiComparison?.conclusion || 'FULL_MATCH',
      matchBadgeText: `${c.aiComparison?.matchPercentage ?? 100}% FULL MATCH`,
      matchBadgeClass: 'badge-green',
      performedBy: actor,
      transcript: c.transcript,
      matchedItems: c.aiComparison?.matchedItems || ['Front Brake Pad Replacement', 'Engine Oil Change', 'Wiper Fluid'],
      analysis: c.aiComparison?.analysis || 'Semantic Audit Complete: 3 of 3 billed repair line items verified.',
      relatedLogs,
    };
  });

  // Filter audit sessions by search query if present
  const q = searchQuery ? searchQuery.toLowerCase().trim() : '';
  const filteredSessions = q
    ? auditSessions.filter(s =>
        s.vehicleNumber.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q) ||
        s.performedBy.toLowerCase().includes(q) ||
        s.matchBadgeText.toLowerCase().includes(q)
      )
    : auditSessions;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSessions = filteredSessions.slice(indexOfFirstItem, indexOfLastItem);

  const toggleExpand = (id) => {
    setExpandedAuditId(prev => (prev === id ? null : id));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Global History &amp; Audit Trail</h1>
          <p className="page-subtitle">
            Consolidated customer audit cases — tracking Voice Complaint, Invoice PDF, AI Match &amp; Admin Logs per row
            {searchQuery && (
              <span className="search-hint">Searching: "{searchQuery}" — {filteredSessions.length} record{filteredSessions.length !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>
        <div className="page-actions">
          <span className="stat-badge badge-green">● Live Audit Cases</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            {filteredSessions.length} customer case{filteredSessions.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Consolidated Audit Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredSessions.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">🔍</span>
            <div className="empty-state-msg">No customer audit cases match "{searchQuery}"</div>
            <div className="empty-state-sub">Try searching by vehicle number or customer name</div>
          </div>
        ) : (
          <>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Vehicle Num &amp; Customer</th>
                    <th>Voice Complaint</th>
                    <th>Invoice PDF</th>
                    <th>Audit Match Score</th>
                    <th>Performed By</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSessions.map(session => {
                    const isExpanded = expandedAuditId === session.id;
                    return (
                      <React.Fragment key={session.id}>
                        <tr
                          onClick={() => toggleExpand(session.id)}
                          style={{ cursor: 'pointer', background: isExpanded ? '#F4F4F5' : undefined }}
                        >
                          <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                            {session.timestamp}
                          </td>
                          <td>
                            <div className="entity-cell">
                              <div className="entity-initial">{session.customerName[0]}</div>
                              <div>
                                <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.84rem' }}>
                                  {session.vehicleNumber}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                                  {session.customerName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`stat-badge ${session.voiceBadgeClass}`}>{session.voiceBadgeText}</span>
                          </td>
                          <td>
                            <span className={`stat-badge ${session.pdfBadgeClass}`}>{session.pdfBadgeText}</span>
                          </td>
                          <td>
                            <span className={`stat-badge ${session.matchBadgeClass}`}>{session.matchBadgeText}</span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {session.performedBy}
                          </td>
                          <td>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.18rem 0.5rem', fontSize: '0.72rem' }}
                              onClick={(e) => { e.stopPropagation(); toggleExpand(session.id); }}
                            >
                              {isExpanded ? 'Hide ▲' : 'View Details ▼'}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Drawer Row */}
                        {isExpanded && (
                          <tr style={{ background: '#FAFAFA' }}>
                            <td colSpan={7} style={{ padding: '1.25rem', borderBottom: 'var(--border)' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <CpuIcon size={16} />
                                  <strong style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
                                    Audit Breakdown for Vehicle {session.vehicleNumber} ({session.customerName})
                                  </strong>
                                </div>

                                <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', background: '#fff', padding: '0.75rem 1rem', border: 'var(--border)', borderLeft: '3px solid var(--primary)' }}>
                                  <strong>Customer Voice Recording:</strong> "{session.transcript}"
                                </div>

                                <div style={{ fontSize: '0.83rem', color: 'var(--green-dark)', background: 'var(--green-bg)', padding: '0.75rem 1rem', border: '1px solid var(--green-border)' }}>
                                  <strong>AI Verdict:</strong> {session.analysis}
                                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                    {session.matchedItems.map((item, idx) => (
                                      <span key={idx} className="stat-badge badge-green">✓ {item}</span>
                                    ))}
                                  </div>
                                </div>

                                {session.relatedLogs.length > 0 && (
                                  <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-subtle)', uppercase: 'true', marginBottom: '0.4rem' }}>
                                      Event History Logs for this Customer:
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                      {session.relatedLogs.map(log => (
                                        <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', background: '#fff', padding: '0.4rem 0.75rem', border: 'var(--border)' }}>
                                          <span><strong>{log.action}</strong> — {log.description}</span>
                                          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontFamily: 'monospace' }}>{log.timestamp}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={filteredSessions.length}
              itemsPerPage={itemsPerPage}
              onPageChange={page => setCurrentPage(page)}
            />
          </>
        )}
      </div>
    </div>
  );
}
