import React from 'react';
import {
  ZapIcon, DashboardIcon, HistoryIcon, CarIcon, LinkIcon,
  MicIcon, CpuIcon, UsersIcon, ReportsIcon, LogoutIcon, MenuIcon, MailIcon
} from './Icons';

const NAV_GROUPS = [
  {
    section: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Dashboard',       icon: DashboardIcon },
      { id: 'history',   label: 'Audit History',   icon: HistoryIcon,  badge: { text: 'LIVE', cls: 'badge-green' } },
    ],
  },
  {
    section: 'OPERATIONS',
    items: [
      { id: 'customers',  label: 'Customers & Vehicles', icon: CarIcon },
      { id: 'links',      label: 'Feedback Tokens',      icon: LinkIcon },
      { id: 'complaints', label: 'Voice & Invoices',      icon: MicIcon },
      { id: 'comparison', label: 'AI Audit Engine',       icon: CpuIcon, badge: { text: '100%', cls: 'badge-green' } },
      { id: 'email-activity', label: 'Email Activity',    icon: MailIcon },
    ],
  },
  {
    section: 'ADMIN',
    items: [
      { id: 'users',   label: 'Staff & Users', icon: UsersIcon },
      { id: 'reports', label: 'Analytics',     icon: ReportsIcon },
    ],
  },
];

export default function Siderail({ activeTab, setActiveTab, collapsed, onToggle, user, onLogout }) {
  const initials = (user?.name || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside className={`siderail${collapsed ? ' collapsed' : ''}`}>

      {/* Brand row — hamburger lives here */}
      <div className="siderail-brand">
        {/* When expanded: logo icon + brand text + collapse button on right */}
        {/* When collapsed: only hamburger centred in brand slot */}
        <button
          className="siderail-toggle-btn"
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label="Toggle sidebar navigation"
        >
          {collapsed ? <MenuIcon size={18} /> : <ZapIcon size={16} />}
        </button>

        <div className="brand-text-wrap">
          <div className="brand-text">AutoAudit AI</div>
          <span className="brand-badge">SaaS Enterprise</span>
        </div>

        {/* Close button — only visible when expanded */}
        <button
          className="siderail-collapse-btn"
          onClick={onToggle}
          title="Collapse sidebar"
          aria-label="Collapse sidebar"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="siderail-nav" aria-label="Main Navigation">
        {NAV_GROUPS.map(group => (
          <div key={group.section}>
            <div className="siderail-section-label">
              <span className="section-label-text">{group.section}</span>
            </div>
            {group.items.map(({ id, label, icon: Icon, badge }) => (
              <button
                key={id}
                className={`nav-item${activeTab === id ? ' active' : ''}`}
                onClick={() => setActiveTab(id)}
                title={label}
                aria-label={label}
                aria-current={activeTab === id ? 'page' : undefined}
              >
                <span className="nav-icon-wrap">
                  <Icon size={17} />
                </span>
                <span className="nav-label">{label}</span>
                {badge && (
                  <span className={`nav-badge ${badge.cls}`}>{badge.text}</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="siderail-footer">
        <div className="user-profile-badge">
          <div className="user-avatar" aria-label={user?.name}>{initials}</div>
          <div className="user-details">
            <span className="user-title">{user?.name || 'System Admin'}</span>
            <span className="user-subtitle">{user?.role || 'Administrator'}</span>
          </div>
        </div>
        <button className="icon-btn logout-btn" onClick={onLogout} title="Sign out" aria-label="Sign out">
          <LogoutIcon size={15} />
        </button>
      </div>
    </aside>
  );
}
