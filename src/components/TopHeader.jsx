import React from 'react';
import { SearchIcon } from './Icons';

const PAGE_TITLES = {
  dashboard:  { title: 'Dashboard',           subtitle: 'Overview & KPIs' },
  history:    { title: 'Audit History',        subtitle: 'Global event log' },
  customers:  { title: 'Customers & Vehicles', subtitle: 'Service records' },
  links:      { title: 'Feedback Tokens',      subtitle: 'Public invite links' },
  complaints: { title: 'Voice & Invoices',     subtitle: 'Recordings & PDFs' },
  comparison: { title: 'AI Audit Engine',      subtitle: 'Semantic matching' },
  'email-activity': { title: 'Email Activity', subtitle: 'Automated message timeline' },
  users:      { title: 'Staff & Users',        subtitle: 'Accounts & roles' },
  reports:    { title: 'Analytics',            subtitle: 'Performance reports' },
};

export default function TopHeader({ searchQuery, onSearch, activeTab }) {
  const page = PAGE_TITLES[activeTab] || PAGE_TITLES.dashboard;

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
          placeholder="Search anything…"
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

      <div className="header-right">
        <div className="system-status">
          <span className="status-dot" />
          <span>Systems Operational</span>
        </div>
      </div>
    </header>
  );
}
