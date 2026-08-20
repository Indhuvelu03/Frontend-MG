import React from 'react';
import { PlusIcon, TrashIcon, EditIcon, ShieldIcon, UserIcon, BuildingIcon, UsersIcon } from '../components/Icons';
import Pagination from '../components/Pagination';

export default function UsersView({
  users = [],
  user,
  serviceCenters = [],
  onAddServiceCenter,
  onEditServiceCenter,
  onRemoveServiceCenter,
  onAddUser,
  onEditUser,
  onDeleteUser,
  searchQuery
}) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 6;

  const isAdmin = user?.role === 'ADMIN';

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff &amp; Service Center Management</h1>
          <p className="page-subtitle">
            Role-Based Access Control (RBAC) — Manage system accounts and service center branches
            {searchQuery && <span className="search-hint">Filtering: "{searchQuery}" — {users.length} result{users.length !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <div className="page-actions">
          <span className="stat-badge badge-purple" style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            Logged in as: {user?.role === 'ADMIN' ? <><ShieldIcon size={13} /> Super Admin</> : <><UserIcon size={13} /> Service Advisor</>}
          </span>
        </div>
      </div>

      {/* Role Capabilities & Access Matrix Banner */}
      <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '1.5rem' }}>
        {/* Super Admin Card */}
        <div className="card accent-purple" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span className="stat-badge badge-purple" style={{ fontSize: '0.82rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldIcon size={13} /> SUPER ADMIN ROLE
            </span>
            <span className="stat-badge badge-green">FULL ACCESS</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Full system control including adding &amp; editing <strong>Service Center Branches</strong>, staff account management, deleting customer records, and voice notes.
          </p>
        </div>

        {/* Service Advisor Card */}
        <div className="card accent-blue" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span className="stat-badge badge-blue" style={{ fontSize: '0.82rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <UserIcon size={13} /> SERVICE ADVISOR ROLE
            </span>
            <span className="stat-badge badge-blue">STAFF ACCESS</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Operational access for service staff: Register &amp; edit customer records, <strong>delete wrongly uploaded invoice PDFs</strong>, and <strong>delete voice notes</strong> when requested by customers.
          </p>
        </div>
      </div>

      {/* Service Centers Management Section */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BuildingIcon size={18} /> Service Center Branches
            </h3>
            <span className="card-subtitle">
              Configured branches displayed in customer registration modal
            </span>
          </div>
          {isAdmin ? (
            <button className="btn btn-primary btn-sm" onClick={onAddServiceCenter}>
              <PlusIcon size={14} /> Add Service Center
            </button>
          ) : (
            <span className="stat-badge badge-amber">Super Admin Managed Only</span>
          )}
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Branch Name</th>
                <th>Location / City</th>
                <th>Manager Email (Escalations)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {serviceCenters.map((s, idx) => (
                <tr key={s.id || idx}>
                  <td style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', width: '40px' }}>{idx + 1}</td>
                  <td><strong>{s.name}</strong></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.location || 'Main'}</td>
                  <td>
                    <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      📧 {s.managerEmail || s.email || 'manager@autoaudit.in'}
                    </span>
                  </td>
                  <td><span className="stat-badge badge-green">● Active</span></td>
                  <td>
                    {isAdmin ? (
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => onEditServiceCenter && onEditServiceCenter(s)}
                          title="Edit service center branch"
                        >
                          <EditIcon size={13} /> Edit
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--coral)', borderColor: 'var(--coral-border)', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => onRemoveServiceCenter && onRemoveServiceCenter(s.id)}
                          title="Delete service center branch"
                        >
                          <TrashIcon size={13} /> Delete
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Read Only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Accounts Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '1rem 1.25rem', borderBottom: 'var(--border)' }}>
          <div>
            <h3 className="card-title">👥 Staff System Accounts</h3>
            <span className="card-subtitle">Registered user login credentials &amp; assigned roles</span>
          </div>
          {isAdmin && (
            <button className="btn btn-primary btn-sm" onClick={onAddUser}>
              <PlusIcon size={14} /> Add Staff Account
            </button>
          )}
        </div>

        {users.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">👤</span>
            <div className="empty-state-msg">No staff accounts match "{searchQuery}"</div>
          </div>
        ) : (
          <>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Staff User</th>
                    <th>Role</th>
                    <th>Permissions</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((u, idx) => (
                    <tr key={u._id || u.id || idx}>
                      <td style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', width: '40px' }}>
                        {indexOfFirstItem + idx + 1}
                      </td>
                      <td>
                        <div className="entity-cell">
                          <div className="entity-initial" style={{ background: u.role === 'ADMIN' ? 'var(--purple-bg)' : 'var(--blue-bg)', color: u.role === 'ADMIN' ? 'var(--purple)' : 'var(--blue)' }}>
                            {(u.name || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{u.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`stat-badge ${u.role === 'ADMIN' ? 'badge-purple' : 'badge-blue'}`}>
                          {u.role === 'ADMIN' ? '🛡️ Super Admin' : '👤 Service Advisor'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {u.role === 'ADMIN' ? 'Full Access + Branch Mgmt' : 'Customer Edit + PDF Delete + Voice Delete'}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '2026-08-01'}</td>
                      <td><span className="stat-badge badge-green">● Active</span></td>
                      <td>
                        {isAdmin ? (
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                              onClick={() => onEditUser && onEditUser(u)}
                              title="Edit staff account"
                            >
                              <EditIcon size={13} /> Edit
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ color: 'var(--coral)', borderColor: 'var(--coral-border)', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                              onClick={() => onDeleteUser && onDeleteUser(u._id || u.id)}
                              title="Delete staff account"
                            >
                              <TrashIcon size={13} /> Delete
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={users.length}
              itemsPerPage={itemsPerPage}
              onPageChange={page => setCurrentPage(page)}
            />
          </>
        )}
      </div>
    </div>
  );
}
