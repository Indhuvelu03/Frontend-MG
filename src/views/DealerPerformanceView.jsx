import React, { useState } from 'react';
import { BuildingIcon, ExternalLinkIcon } from '../components/Icons';
import Pagination from '../components/Pagination';

// SVG Icons (Strictly SVGs, no text/string emojis)
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const CheckCircleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const AlertTriangleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

export default function DealerPerformanceView({
  dealers = [], users = [], customers = [], complaints = [],
  onViewDealerDashboard, onAddDealer, globalSearchQuery = '', analytics = null
}) {
  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState('customers');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // ── Calculate metrics per dealer ──────────────────────────────────────────────
  const dealerRows = analytics?.dealerRanking?.length ? analytics.dealerRanking.map(metric => {
    const d = dealers.find(item => (item._id || item.id) === metric.dealershipId) || { _id: metric.dealershipId, name: metric.name, city: metric.city, code: metric.code };
    return { dealer: d, id: metric.dealershipId, advisors: metric.advisors, customers: metric.customers, completed: metric.audits, ongoing: metric.openCases, avg: metric.averageScore, flags: metric.flags, appUsers: metric.advisors };
  }) : dealers.map(d => {
    const id = d._id || d.id;
    const dUsers    = users.filter(u => u.dealershipId === id || u.dealerId === id);
    const advisors  = dUsers.filter(u => u.role === 'STAFF').length;
    const dCusts    = customers.filter(c => c.dealerId === id || c.dealershipId === id);
    const dComps    = complaints.filter(c => c.dealershipId === id || dCusts.some(cu => (cu._id || cu.id) === (c.customerId || c.customer_id)));
    const completed = dComps.filter(c => c.status === 'COMPARED' || c.aiComparison).length;
    const ongoing   = Math.max(0, dCusts.length - completed);
    const scores    = dComps.map(c => Number(c.aiComparison?.matchPercentage ?? c.comparisonScore)).filter(Number.isFinite);
    const avg       = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    const flags     = dComps.filter(c => Number(c.aiComparison?.matchPercentage ?? c.comparisonScore ?? 100) < 60 || c.status === 'FLAGGED').length;
    return { dealer: d, id, advisors, customers: dCusts.length, completed, ongoing, avg, flags, appUsers: dUsers.length };
  });

  // ── Sort ──────────────────────────────────────────────────────────────────────
  const sorted = [...dealerRows].sort((a, b) => {
    if (sortBy === 'customers') return b.customers - a.customers;
    if (sortBy === 'completed') return b.completed - a.completed;
    if (sortBy === 'ongoing')   return b.ongoing   - a.ongoing;
    if (sortBy === 'score')     return (b.avg ?? -1) - (a.avg ?? -1);
    return 0;
  });

  // ── Filter ────────────────────────────────────────────────────────────────────
  const query = (localSearch || globalSearchQuery).trim().toLowerCase();
  const filtered = query
    ? sorted.filter(r =>
        (r.dealer.name || '').toLowerCase().includes(query) ||
        (r.dealer.city || '').toLowerCase().includes(query) ||
        (r.dealer.managerEmail || r.dealer.manager_email || '').toLowerCase().includes(query))
    : sorted;

  // ── Paginate ──────────────────────────────────────────────────────────────────
  const totalItems = filtered.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDealers = filtered.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dealer Performance</h1>
          <p className="page-subtitle">
            Comprehensive audit progress, customer volume &amp; staff breakdown per dealership branch
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={onAddDealer} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PlusIcon /> Add Dealer Branch
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div style={{ background: '#fff', border: '1px solid #E4E4E7', borderRadius: '10px', overflow: 'hidden' }}>
        
        {/* Grouped Filter & Search Toolbar Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #E4E4E7',
          background: '#FAFAFA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {/* Left: Grouped Search + Filter Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1, minWidth: 280 }}>
            {/* Search Input Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#fff',
              border: '1px solid #E4E4E7',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              width: '260px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}>
              <span style={{ color: '#A1A1AA', display: 'flex', alignItems: 'center' }}>
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search branch, city, manager..."
                value={localSearch}
                onChange={e => { setLocalSearch(e.target.value); setCurrentPage(1); }}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '0.82rem',
                  width: '100%',
                  color: '#18181B'
                }}
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch('')}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#A1A1AA', fontSize: '0.8rem', padding: 0 }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Group Divider */}
            <div style={{ height: '20px', width: '1px', background: '#E4E4E7' }} />

            {/* Filter Group */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#71717A', display: 'flex', alignItems: 'center', gap: '0.3rem', marginRight: '0.2rem' }}>
                <FilterIcon /> Sort:
              </span>
              {[
                { key: 'customers', label: 'By Customers' },
                { key: 'completed', label: 'By Completed' },
                { key: 'ongoing',   label: 'By Ongoing' },
                { key: 'score',     label: 'By Score' },
              ].map(s => (
                <button
                  key={s.key}
                  onClick={() => { setSortBy(s.key); setCurrentPage(1); }}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.3rem 0.7rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    background: sortBy === s.key ? '#18181B' : '#FFFFFF',
                    color:      sortBy === s.key ? '#FFFFFF' : '#52525B',
                    border:     sortBy === s.key ? '1px solid #18181B' : '1px solid #E4E4E7',
                    boxShadow:  sortBy === s.key ? '0 1px 3px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.02)'
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Record count */}
          <div style={{ fontSize: '0.78rem', color: '#71717A', fontWeight: 500 }}>
            Showing <strong>{filtered.length}</strong> branch{filtered.length !== 1 ? 'es' : ''}
          </div>
        </div>

        {/* Table Container — Responsive layout without clipping/cropping */}
        <div style={{ overflowX: 'auto', width: '100%', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem', color: '#D4D4D8' }}>
                <BuildingIcon size={40} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '0.98rem', color: '#18181B', marginBottom: '0.35rem' }}>
                {query ? `No dealers match "${query}"` : 'No Dealers Found'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#71717A', maxWidth: 360, margin: '0 auto 1.25rem', lineHeight: 1.5 }}>
                Try adjusting your search query or sorting filter.
              </p>
            </div>
          ) : (
            <table className="custom-table" style={{ width: '100%', minWidth: '860px', tableLayout: 'auto' }}>
              <thead>
                <tr>
                  <th style={{ width: '32px', padding: '0.65rem 0.5rem 0.65rem 0.85rem' }}>#</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Dealer Branch</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>City</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Manager</th>
                  <th style={{ textAlign: 'center', padding: '0.65rem 0.4rem' }}>Advisors</th>
                  <th style={{ textAlign: 'center', padding: '0.65rem 0.4rem' }}>Customers</th>
                  <th style={{ textAlign: 'center', padding: '0.65rem 0.4rem' }}>Completed</th>
                  <th style={{ textAlign: 'center', padding: '0.65rem 0.4rem' }}>Ongoing</th>
                  <th style={{ textAlign: 'center', padding: '0.65rem 0.4rem' }}>Avg Score</th>
                  <th style={{ textAlign: 'center', padding: '0.65rem 0.4rem' }}>Flags</th>
                  <th style={{ textAlign: 'right', padding: '0.65rem 0.85rem 0.65rem 0.4rem', width: '90px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentDealers.map((r, idx) => {
                  const d = r.dealer;
                  const itemIndex = indexOfFirstItem + idx + 1;
                  const scoreColor = r.avg === null ? '#71717A' : r.avg >= 80 ? '#059669' : r.avg >= 60 ? '#D97706' : '#DC2626';
                  const scoreBg    = r.avg === null ? '#F4F4F5' : r.avg >= 80 ? '#ECFDF5' : r.avg >= 60 ? '#FFFBEB' : '#FEF2F2';
                  const scoreBorder= r.avg === null ? '#E4E4E7' : r.avg >= 80 ? '#A7F3D0' : r.avg >= 60 ? '#FDE68A' : '#FECACA';

                  return (
                    <tr key={r.id || idx}>
                      <td style={{ color: '#A1A1AA', fontSize: '0.75rem', fontWeight: 600, padding: '0.75rem 0.5rem 0.75rem 0.85rem' }}>{itemIndex}</td>

                      {/* Branch Name */}
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: '6px',
                            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                            color: '#2563EB', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', flexShrink: 0, fontWeight: 800, fontSize: '0.85rem'
                          }}>
                            {(d.name || 'D')[0].toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0, maxWidth: '160px' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#18181B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {d.name}
                            </div>
                            {d.code && <div style={{ fontSize: '0.66rem', color: '#A1A1AA', fontFamily: 'monospace' }}>{d.code}</div>}
                          </div>
                        </div>
                      </td>

                      <td style={{ fontSize: '0.8rem', color: '#52525B', fontWeight: 500, padding: '0.75rem 0.5rem' }}>{d.city || '—'}</td>

                      {/* Manager */}
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <div style={{ fontSize: '0.76rem', color: '#52525B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                          {d.managerEmail || d.manager_email || '—'}
                        </div>
                      </td>

                      {/* Advisors */}
                      <td style={{ textAlign: 'center', padding: '0.75rem 0.4rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#7C3AED', background: '#F5F3FF', border: '1px solid #DDD6FE', padding: '0.12rem 0.45rem', borderRadius: '4px' }}>
                          {r.advisors}
                        </span>
                      </td>

                      {/* Customers */}
                      <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '0.85rem', color: '#18181B', padding: '0.75rem 0.4rem' }}>
                        {r.customers}
                      </td>

                      {/* Completed Audits */}
                      <td style={{ textAlign: 'center', padding: '0.75rem 0.4rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, fontSize: '0.78rem', color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.12rem 0.45rem', borderRadius: '4px' }}>
                          <CheckCircleIcon /> {r.completed}
                        </span>
                      </td>

                      {/* Ongoing */}
                      <td style={{ textAlign: 'center', padding: '0.75rem 0.4rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, fontSize: '0.78rem', color: r.ongoing > 0 ? '#D97706' : '#71717A', background: r.ongoing > 0 ? '#FFFBEB' : '#F4F4F5', border: `1px solid ${r.ongoing > 0 ? '#FDE68A' : '#E4E4E7'}`, padding: '0.12rem 0.45rem', borderRadius: '4px' }}>
                          <ClockIcon /> {r.ongoing}
                        </span>
                      </td>

                      {/* Score */}
                      <td style={{ textAlign: 'center', padding: '0.75rem 0.4rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.78rem', color: scoreColor, background: scoreBg, border: `1px solid ${scoreBorder}`, padding: '0.12rem 0.45rem', borderRadius: '4px' }}>
                          {r.avg !== null ? `${r.avg}%` : '—'}
                        </span>
                      </td>

                      {/* Fraud Flags */}
                      <td style={{ textAlign: 'center', padding: '0.75rem 0.4rem' }}>
                        {r.flags > 0 ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontWeight: 700, fontSize: '0.76rem', color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', padding: '0.12rem 0.4rem', borderRadius: '4px' }}>
                            <AlertTriangleIcon /> {r.flags}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: '#A1A1AA' }}>—</span>
                        )}
                      </td>

                      {/* Action */}
                      <td style={{ textAlign: 'right', padding: '0.75rem 0.85rem 0.75rem 0.4rem' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.28rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}
                          onClick={() => onViewDealerDashboard && onViewDealerDashboard(d)}
                        >
                          View <ExternalLinkIcon size={11} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={page => setCurrentPage(page)}
        />
      </div>
    </div>
  );
}
