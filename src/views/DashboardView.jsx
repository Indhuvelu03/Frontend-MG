import React, { useState } from 'react';
import { MicIcon, PlusIcon, ZapIcon, UsersIcon, CarIcon, LinkIcon, CpuIcon, ExternalLinkIcon } from '../components/Icons';
import Pagination from '../components/Pagination';

export default function DashboardView({ customers, complaints, historyLogs, getCustName, onNewCustomer, onNewLink, setActiveTab, searchQuery }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentComplaints = complaints.slice(indexOfFirstItem, indexOfLastItem);

  const verifiedCount = complaints.filter(c => c.status === 'COMPARED' || c.comparisonScore >= 60 || c.aiComparison?.matchPercentage >= 60).length;
  const fraudCount = complaints.filter(c => (c.comparisonScore || 100) < 60 || c.status === 'FLAGGED').length;
  const completedAudits = complaints.filter(c => c.status === 'COMPARED' || c.aiComparison || typeof c.comparisonScore === 'number');
  const scores = completedAudits.map(c => Number(c.aiComparison?.matchPercentage ?? c.comparisonScore)).filter(Number.isFinite);
  const averageScore = scores.length ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length) : null;
  const auditStatus = (complaint) => {
    if (complaint.status === 'COMPARED' || complaint.aiComparison || typeof complaint.comparisonScore === 'number') return 'COMPLETE';
    if (complaint.status === 'FAILED') return 'ACTION NEEDED';
    return (complaint.status || 'PROCESSING').replaceAll('_', ' ');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">
            Real-time command center — vehicle complaints, invoice auditing &amp; AI fraud detection
            {searchQuery && <span className="search-hint">Filtering: "{searchQuery}"</span>}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={onNewCustomer}>
            <PlusIcon size={14} /> New Customer
          </button>
          <button className="btn btn-primary" onClick={onNewLink}>
            <PlusIcon size={14} /> Generate Feedback Link
          </button>
        </div>
      </div>

      {/* KPI Stat Cards — Clickable Navigation */}
      <div className="stats-grid">
        <div className="stat-card accent-green" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('comparison')}>
          <div className="stat-card-top">
            <div className="stat-icon green"><ZapIcon size={16} /></div>
            <span className="stat-trend up">Live</span>
          </div>
          <div className="stat-label">AI Verified Matches</div>
          <div className="stat-value-row">
            <span className="stat-value">{verifiedCount}</span>
            <span className="stat-badge badge-green">Audited</span>
          </div>
          <div className="stat-trend-label">Click to inspect comparisons →</div>
        </div>

        <div className="stat-card accent-blue" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('reports')}>
          <div className="stat-card-top">
            <div className="stat-icon blue"><CpuIcon size={16} /></div>
            <span className="stat-trend up">Live data</span>
          </div>
          <div className="stat-label">Average Match Score</div>
          <div className="stat-value-row">
            <span className="stat-value">{averageScore !== null ? `${averageScore}%` : '—'}</span>
            <span className={`stat-badge ${averageScore !== null ? 'badge-green' : 'badge-amber'}`}>{averageScore !== null ? 'Completed audits' : 'Awaiting audit'}</span>
          </div>
          <div className="stat-trend-label">Across all service centers →</div>
        </div>

        <div className="stat-card accent-amber" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('customers')}>
          <div className="stat-card-top">
            <div className="stat-icon amber"><CarIcon size={16} /></div>
            <span className="stat-trend up">Total</span>
          </div>
          <div className="stat-label">Active Customers &amp; Vehicles</div>
          <div className="stat-value-row">
            <span className="stat-value">{customers.length}</span>
            <span className="stat-badge badge-amber">Registered</span>
          </div>
          <div className="stat-trend-label">Click to manage vehicle database →</div>
        </div>

        <div className="stat-card accent-coral" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('complaints')}>
          <div className="stat-card-top">
            <div className="stat-icon coral"><UsersIcon size={16} /></div>
          </div>
          <div className="stat-label">Fraud Flags &amp; Review</div>
          <div className="stat-value-row">
            <span className="stat-value" style={{ color: fraudCount > 0 ? 'var(--coral)' : 'var(--text-main)' }}>{fraudCount}</span>
            <span className={`stat-badge ${fraudCount > 0 ? 'badge-coral' : 'badge-green'}`}>{fraudCount > 0 ? 'Action Needed' : 'Clean Audit'}</span>
          </div>
          <div className="stat-trend-label">Click to review voice notes →</div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="dashboard-grid">

        {/* Recent Voice Feedback Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '1.25rem 1.5rem', marginBottom: 0 }}>
            <div>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MicIcon size={15} /> Voice Feedback &amp; Audit Status
              </h3>
              <span className="card-subtitle">Latest customer recordings with AI cross-match results</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('complaints')}>
              View All Complaints <ExternalLinkIcon size={12} />
            </button>
          </div>

          {complaints.length === 0 ? (
            <div className="empty-state">
              <div style={{
                width: '48px', height: '48px', background: 'var(--primary-soft)', border: 'var(--border)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem'
              }}>
                <MicIcon size={24} />
              </div>
              <div className="empty-state-msg">No feedback records {searchQuery ? `match "${searchQuery}"` : 'yet'}</div>
              <div className="empty-state-sub">Generate a feedback link to receive customer voice recordings</div>
            </div>
          ) : (
            <>
              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Vehicle</th>
                      <th>Transcript</th>
                      <th>Audit</th>
                      <th>Score</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentComplaints.map(c => (
                      <tr key={c._id}>
                        <td>
                          <div className="entity-cell">
                            <div className="entity-initial">{getCustName(c.customerId)[0]}</div>
                            <span style={{ fontWeight: 600 }}>{getCustName(c.customerId)}</span>
                          </div>
                        </td>
                        <td><strong style={{ fontFamily: 'monospace', letterSpacing: '0.03em', fontWeight: 700 }}>{c.vehicleNumber}</strong></td>
                        <td className="cell-truncate">"{c.transcript || 'Transcribing…'}"</td>
                        <td><span className={`stat-badge ${auditStatus(c) === 'COMPLETE' ? 'badge-green' : auditStatus(c) === 'ACTION NEEDED' ? 'badge-coral' : 'badge-amber'}`}>{auditStatus(c)}</span></td>
                        <td><span className={`stat-badge ${typeof (c.aiComparison?.matchPercentage ?? c.comparisonScore) === 'number' ? 'badge-green' : 'badge-amber'}`}>{typeof (c.aiComparison?.matchPercentage ?? c.comparisonScore) === 'number' ? `${c.aiComparison?.matchPercentage ?? c.comparisonScore}%` : '—'}</span></td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('comparison')}>Inspect</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalItems={complaints.length}
                itemsPerPage={itemsPerPage}
                onPageChange={page => setCurrentPage(page)}
              />
            </>
          )}
        </div>

      </div>
    </div>
  );
}
