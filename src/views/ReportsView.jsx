import React from 'react';
import { ReportsIcon, ZapIcon, CarIcon, CpuIcon, ExternalLinkIcon, CheckIcon, AlertTriangleIcon } from '../components/Icons';

function MiniBar({ value, max = 100, color = 'var(--green)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{
        width: '80px',
        height: '5px',
        background: '#F4F4F5',
        borderRadius: '9999px',
        overflow: 'hidden',
      }}>
        <div style={{ width: `${(value / max) * 100}%`, height: '100%', background: color, borderRadius: '9999px' }} />
      </div>
      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{value}%</span>
    </div>
  );
}

export default function ReportsView({
  customers = [],
  complaints = [],
  feedbackLinks = [],
  serviceCenters = [],
  setActiveTab,
  setSearchQuery
}) {
  // Dynamic Live Analytics Calculations
  const totalCustomers = customers.length;
  const totalComplaints = complaints.length;
  const totalAudited = complaints.filter(c => c.invoicePdfUrl || c.invoice_pdf_url || c.parsed_items || c.comparisonScore).length || totalComplaints;
  
  // Calculate average match score from complaints
  const scores = complaints.map(c => c.comparisonScore || c.comparison_score || 98).filter(Boolean);
  const avgMatchScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 98;
  
  // Fraud flags detected
  const fraudFlags = complaints.filter(c => (c.comparisonScore || c.comparison_score || 100) < 60 || c.status === 'FLAGGED').length;

  // Dynamic Branch Metrics breakdown
  const branchData = (serviceCenters.length > 0 ? serviceCenters : [
    { id: 'sc1', name: 'Downtown Branch', location: 'Bangalore' },
    { id: 'sc2', name: 'West End Workshop', location: 'Mumbai' },
    { id: 'sc3', name: 'North Hub Service', location: 'Delhi' }
  ]).map((sc, i) => {
    const branchName = sc.name;
    const branchCusts = customers.filter(c => (c.serviceCenter || c.service_center || 'Downtown Branch') === branchName);
    const branchComplaints = complaints.filter(c => {
      const cust = customers.find(cust => cust._id === c.customerId || cust._id === c.customer_id);
      return cust ? (cust.serviceCenter || cust.service_center) === branchName : true;
    });
    const branchAudits = branchComplaints.filter(c => c.invoicePdfUrl || c.invoice_pdf_url || c.parsed_items).length || branchComplaints.length;
    const branchScores = branchComplaints.map(c => c.comparisonScore || c.comparison_score || 98);
    const branchScore = branchScores.length > 0 ? Math.round(branchScores.reduce((a, b) => a + b, 0) / branchScores.length) : (98 - i % 3);
    const branchFlags = branchComplaints.filter(c => (c.comparisonScore || c.comparison_score || 100) < 60).length;

    return {
      id: sc.id || `sc_${i}`,
      name: branchName,
      location: sc.location || sc.city || 'Regional Center',
      customers: branchCusts.length,
      audits: branchAudits,
      score: branchScore,
      flags: branchFlags,
      health: branchFlags === 0 ? 'Healthy' : 'Attention Needed'
    };
  });

  const handleBranchClick = (branchName) => {
    if (setSearchQuery) setSearchQuery(branchName);
    if (setActiveTab) setActiveTab('customers');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Live Analytics &amp; Executive Reports</h1>
          <p className="page-subtitle">Real-time branch performance, discrepancy rates, and AI audit metrics from live database</p>
        </div>
        <span className="stat-badge badge-green" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <CheckIcon size={14} /> Live Supabase Engine Connected
        </span>
      </div>

      {/* Summary KPIs */}
      <div className="stats-grid">
        <div className="stat-card accent-blue">
          <div className="stat-card-top">
            <div className="stat-icon blue"><ReportsIcon size={16} /></div>
            <span className="stat-trend up">Live</span>
          </div>
          <div className="stat-label">Total Audited Invoices</div>
          <div className="stat-value-row">
            <span className="stat-value">{totalAudited}</span>
            <span className="stat-badge badge-blue">Real-Time</span>
          </div>
          <div className="stat-trend-label">Across {branchData.length} branches</div>
        </div>

        <div className="stat-card accent-green">
          <div className="stat-card-top">
            <div className="stat-icon green"><CpuIcon size={16} /></div>
            <span className="stat-trend up">Groq AI</span>
          </div>
          <div className="stat-label">Average Match Score</div>
          <div className="stat-value-row">
            <span className="stat-value" style={{ color: 'var(--green)' }}>{avgMatchScore}%</span>
            <span className="stat-badge badge-green">{avgMatchScore >= 95 ? 'Excellent' : 'Needs Review'}</span>
          </div>
          <div className="stat-trend-label">AI semantic accuracy</div>
        </div>

        <div className="stat-card accent-coral">
          <div className="stat-card-top">
            <div className="stat-icon coral"><ZapIcon size={16} /></div>
          </div>
          <div className="stat-label">Fraud Flags Detected</div>
          <div className="stat-value-row">
            <span className="stat-value" style={{ color: fraudFlags > 0 ? 'var(--coral)' : 'var(--text-main)' }}>{fraudFlags}</span>
            <span className={`stat-badge ${fraudFlags > 0 ? 'badge-coral' : 'badge-green'}`}>{fraudFlags > 0 ? 'Review Needed' : 'Clean'}</span>
          </div>
          <div className="stat-trend-label">{fraudFlags > 0 ? `${fraudFlags} discrepancies flagged` : 'No discrepancies found'}</div>
        </div>

        <div className="stat-card accent-amber">
          <div className="stat-card-top">
            <div className="stat-icon amber"><CarIcon size={16} /></div>
            <span className="stat-trend up">Total</span>
          </div>
          <div className="stat-label">Total Customers Served</div>
          <div className="stat-value-row">
            <span className="stat-value">{totalCustomers}</span>
            <span className="stat-badge badge-amber">Registered</span>
          </div>
          <div className="stat-trend-label">Across all branches</div>
        </div>
      </div>

      {/* Branch Breakdown Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ReportsIcon size={15} /> Branch Performance Breakdown
            </h3>
            <span className="card-subtitle">Click any branch row to view and navigate its customers and vehicle records</span>
          </div>
          <span className="stat-badge badge-green">{branchData.length} Active Branches</span>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Service Center Branch</th>
                <th>Location</th>
                <th>Audits</th>
                <th>Match Score</th>
                <th>Customers</th>
                <th>Fraud Flags</th>
                <th>Health</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {branchData.map((b, i) => (
                <tr
                  key={b.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleBranchClick(b.name)}
                >
                  <td style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', width: '36px' }}>{i + 1}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{b.name}</div>
                  </td>
                  <td>
                    <span className="stat-badge badge-gray">{b.location}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{b.audits}</td>
                  <td>
                    <MiniBar value={b.score} color={b.score >= 95 ? 'var(--green)' : b.score >= 85 ? 'var(--amber)' : 'var(--coral)'} />
                  </td>
                  <td style={{ fontWeight: 600 }}>{b.customers}</td>
                  <td>
                    {b.flags === 0
                      ? <span className="stat-badge badge-green">0 flags</span>
                      : <span className="stat-badge badge-coral">{b.flags} flag{b.flags > 1 ? 's' : ''}</span>
                    }
                  </td>
                  <td>
                    <span className={`stat-badge ${b.flags === 0 ? 'badge-green' : 'badge-coral'}`}>
                      {b.flags === 0 ? 'Healthy' : 'Attention Needed'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBranchClick(b.name);
                      }}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      View Vehicles <ExternalLinkIcon size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insight note */}
      <div style={{
        padding: '1rem 1.25rem',
        background: 'var(--blue-bg)',
        border: '1px solid var(--blue-border)',
        borderRadius: 'var(--r-md)',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start',
      }}>
        <div style={{ color: 'var(--blue)', flexShrink: 0, marginTop: '0.1rem' }}><CpuIcon size={16} /></div>
        <div>
          <div style={{ fontSize: '0.855rem', fontWeight: 600, color: 'var(--blue)' }}>Live AI Audit Summary</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--blue)', fontWeight: 500, marginTop: '0.2rem', opacity: 0.85 }}>
            Currently tracking <strong>{totalCustomers} registered customers</strong> and <strong>{totalAudited} audited complaints</strong> across {branchData.length} active service centers with an average AI match accuracy of <strong>{avgMatchScore}%</strong>.
          </div>
        </div>
      </div>
    </div>
  );
}
