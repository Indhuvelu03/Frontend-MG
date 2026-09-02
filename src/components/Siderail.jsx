import React from 'react';
import {
  ZapIcon, DashboardIcon, HistoryIcon, CarIcon, LinkIcon,
  MicIcon, CpuIcon, UsersIcon, ReportsIcon, LogoutIcon, MenuIcon, MailIcon, ShieldIcon, BuildingIcon
} from './Icons';

// ── Nav definitions per role ──────────────────────────────────────────────────

const ADMIN_NAV = [
  {
    section: 'OVERVIEW',
    items: [
      { id: 'network-dashboard',  label: 'Network Overview',    icon: DashboardIcon, badge: { text: 'LIVE', cls: 'badge-green' } },
      { id: 'dealer-performance', label: 'Dealer Performance',  icon: CpuIcon },
    ],
  },
  {
    section: 'MANAGEMENT',
    items: [
      { id: 'dealers', label: 'Dealers',   icon: BuildingIcon },
      { id: 'users',   label: 'Users',     icon: UsersIcon },
      { id: 'reports', label: 'Analytics', icon: ReportsIcon },
    ],
  },
];

const DEALER_NAV = [
  {
    section: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Dashboard',     icon: DashboardIcon },
      { id: 'history',   label: 'Audit History', icon: HistoryIcon, badge: { text: 'LIVE', cls: 'badge-green' } },
    ],
  },
  {
    section: 'OPERATIONS',
    items: [
      { id: 'customers',      label: 'Customers & Vehicles', icon: CarIcon },
      { id: 'links',          label: 'Feedback Tokens',      icon: LinkIcon },
      { id: 'complaints',     label: 'Voice & Invoices',      icon: MicIcon },
      { id: 'comparison',     label: 'AI Audit Engine',       icon: CpuIcon },
      { id: 'email-activity', label: 'Communications',        icon: MailIcon },
      { id: 'manager-review', label: 'Manager Review',        icon: ShieldIcon },
    ],
  },
  {
    section: 'MANAGEMENT',
    items: [
      { id: 'service-centers', label: 'Service Centers', icon: BuildingIcon },
      { id: 'users',           label: 'Staff / Advisors', icon: UsersIcon },
      { id: 'reports',         label: 'Analytics & Reports', icon: ReportsIcon },
    ],
  },
];

const STAFF_NAV = [
  {
    section: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Dashboard',     icon: DashboardIcon },
      { id: 'history',   label: 'Audit History', icon: HistoryIcon, badge: { text: 'LIVE', cls: 'badge-green' } },
    ],
  },
  {
    section: 'OPERATIONS',
    items: [
      { id: 'customers',      label: 'Customers & Vehicles', icon: CarIcon },
      { id: 'links',          label: 'Feedback Tokens',      icon: LinkIcon },
      { id: 'complaints',     label: 'Voice & Invoices',      icon: MicIcon },
      { id: 'comparison',     label: 'AI Audit Engine',       icon: CpuIcon },
      { id: 'email-activity', label: 'Communications',        icon: MailIcon },
      { id: 'manager-review', label: 'Manager Review',        icon: ShieldIcon },
    ],
  },
];

export default function Siderail({ activeTab, setActiveTab, collapsed, onToggle, user, onLogout, onSecurity, dealerContext = false }) {
  const initials = (user?.name || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  // Pick the correct nav structure for this role
  const NAV_GROUPS = user?.role === 'ADMIN' && !dealerContext
    ? ADMIN_NAV
    : user?.role === 'STAFF'
      ? STAFF_NAV
      : DEALER_NAV;

  return (
    <aside className={`siderail${collapsed ? ' collapsed' : ''}`}>

      {/* Brand row */}
      <div className="siderail-brand">
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

        <button
          className="siderail-collapse-btn"
          onClick={onToggle}
          title="Collapse sidebar"
          aria-label="Collapse sidebar"
        >
          <MenuIcon size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="siderail-nav" aria-label="Main navigation">
        {NAV_GROUPS.map((grp) => (
          <div key={grp.section} className="nav-group">
            <div className="nav-section-title">{grp.section}</div>
            {grp.items.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-item${isActive ? ' active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                  title={collapsed ? item.label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="nav-item-icon">
                    <IconComponent size={17} />
                  </span>
                  <span className="nav-item-label">{item.label}</span>
                  {item.badge && !collapsed && (
                    <span className={`nav-item-badge ${item.badge.cls}`}>
                      {item.badge.text}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer / Profile */}
      <div className="siderail-footer">
        <div className="user-profile-widget">
          <div className="user-avatar" style={{
            background: user?.role === 'ADMIN' ? 'var(--purple-bg)' : 'var(--blue-bg)',
            color: user?.role === 'ADMIN' ? 'var(--purple)' : 'var(--blue)'
          }}>
            {initials}
          </div>

          <div className="user-info">
            <div className="user-name">{user?.name || 'Administrator'}</div>
            <div className="user-role">
              {user?.role === 'ADMIN'
                ? (dealerContext ? 'Super Admin · Dealer View' : 'Super Admin')
                : user?.role === 'DEALER' ? 'Dealer Manager' : 'Service Advisor'}
            </div>
          </div>

          <button className="logout-icon-btn" onClick={onSecurity} title="Account security" aria-label="Account security">
            <ShieldIcon size={16} />
          </button>

          <button
            className="logout-icon-btn"
            onClick={onLogout}
            title="Sign out of AutoAudit AI"
            aria-label="Sign out"
          >
            <LogoutIcon size={16} />
          </button>
        </div>
      </div>

    </aside>
  );
}
