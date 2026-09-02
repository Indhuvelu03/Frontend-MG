import React from 'react';
import { SearchIcon, BuildingIcon } from './Icons';

const PAGE_TITLES = {
  dashboard:        { title: 'Dashboard',           subtitle: 'Overview & KPIs' },
  history:          { title: 'Audit History',        subtitle: 'Global event log' },
  customers:        { title: 'Customers & Vehicles', subtitle: 'Service records' },
  links:            { title: 'Feedback Tokens',      subtitle: 'Public invite links' },
  complaints:       { title: 'Voice & Invoices',     subtitle: 'Recordings & PDFs' },
  comparison:       { title: 'AI Audit Engine',      subtitle: 'Semantic matching' },
  'service-centers':{ title: 'Service Centers',      subtitle: 'Branch workshop management' },
  dealers:          { title: 'Dealers',              subtitle: 'Dealer branches & dashboards' },
  dealerships:      { title: 'Dealers',              subtitle: 'Dealer branches & dashboards' },
  'email-activity': { title: 'Communications',     subtitle: 'WhatsApp, SMS and email delivery timeline' },
  'manager-review': { title: 'Manager Review',     subtitle: 'Escalations and SLA exceptions' },
  users:            { title: 'Users',                subtitle: 'Accounts & roles' },
  reports:          { title: 'Analytics',            subtitle: 'Performance reports' },
};

export default function TopHeader({
  searchQuery,
  onSearch,
  activeTab,
  user,
  dealerships = [],
  activeDealershipId = '',
  setActiveDealershipId,
  dealerContext = false
}) {
  const page = PAGE_TITLES[activeTab] || PAGE_TITLES.dashboard;
  const isAdmin = user?.role === 'ADMIN';

  const assignedDealership = dealerships.find(d => (d._id || d.id) === (user?.dealershipId || activeDealershipId));

  return (
    <header className="top-header">
      {/* Page context — title + subtitle */}
      <div className="header-page-context">
        <span className="header-page-title">{page.title}</span>
        <span className="header-page-sep">·</span>
        <span className="header-page-sub">{page.subtitle}</span>
      </div>

      {/* Global search */}
      <div className="header-search-bar">
        <span className="header-search-icon">
          <SearchIcon size={14} />
        </span>
        <input
          type="text"
          id="global-search"
          value={searchQuery}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search customers, complaints, or vehicles…"
          aria-label="Global search"
          autoComplete="off"
          spellCheck="false"
        />
        {searchQuery && (
          <button
            className="search-clear-btn"
            onClick={() => onSearch('')}
            aria-label="Clear search"
          >×</button>
        )}
      </div>

      {/* Right controls — Scope Switcher & System Status */}
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        {isAdmin ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Scope:</span>
            <select
              className="form-select"
              value={activeDealershipId}
              onChange={e => setActiveDealershipId && setActiveDealershipId(e.target.value)}
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', background: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '4px', fontWeight: 600, color: 'var(--text-main)' }}
            >
              <option value="">{dealerContext ? 'Exit dealer view' : 'All Dealers'}</option>
              {dealerships.map(d => (
                <option key={d._id || d.id} value={d._id || d.id}>
                  {d.name} ({d.city || 'Branch'})
                </option>
              ))}
            </select>
          </div>
        ) : assignedDealership ? (
          <span className="stat-badge badge-purple" style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
            <BuildingIcon size={13} /> {assignedDealership.name} ({assignedDealership.city})
          </span>
        ) : null}

        <div className="system-status" style={{ whiteSpace: 'nowrap' }}>
          <span className="status-dot" />
          <span>Operational</span>
        </div>
      </div>
    </header>
  );
}
