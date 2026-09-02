import React from 'react';
import { PlusIcon, TrashIcon, EditIcon, BuildingIcon, ShieldIcon, UserIcon, UsersIcon } from '../components/Icons';
import Pagination from '../components/Pagination';

export default function DealershipsView({
  dealerships = [],
  user,
  onAddDealership,
  onEditDealership,
  onDeleteDealership,
  searchQuery,
  customers = [],
  complaints = []
}) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 6;

  const isAdmin = user?.role === 'ADMIN';

  const filteredDealerships = searchQuery
    ? dealerships.filter(d =>
        (d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.managerEmail || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : dealerships;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDealerships = filteredDealerships.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🏢 Multi-Tenant Dealership Branches</h1>
          <p className="page-subtitle">
            Super Admin Portal — Register, manage, and monitor dealership branches and tenant isolation
            {searchQuery && <span className="search-hint">Filtering: "{searchQuery}" — {filteredDealerships.length} result{filteredDealerships.length !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <div className="page-actions">
          {isAdmin && (
            <button className="btn btn-primary" onClick={onAddDealership}>
              <PlusIcon size={16} /> Add Dealership Branch
            </button>
          )}
        </div>
      </div>

      {/* Overview Banner */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.5rem' }}>
        <div className="card accent-purple" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Registered Dealerships
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
            {dealerships.length}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Multi-location isolated branches</span>
        </div>

        <div className="card accent-blue" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Managed Customers
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
            {customers.length}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Across all active dealership branches</span>
        </div>

        <div className="card accent-green" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Processed AI Audits
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
            {complaints.length}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Voice &amp; invoice verified complaints</span>
        </div>
      </div>

      {/* Main Dealership Cards / Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '1rem 1.25rem', borderBottom: 'var(--border)' }}>
          <div>
            <h3 className="card-title">🏢 Active Dealership Branches</h3>
            <span className="card-subtitle">Each branch operates with an isolated data scope for customers and staff</span>
          </div>
        </div>

        {filteredDealerships.length === 0 ? (
          <div className="empty-state" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              {searchQuery ? `No dealerships match "${searchQuery}"` : "No Dealership Branches Created Yet"}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
              Super Admins can create dealership branches. Each branch receives its own isolated dashboard, customer records, and assigned staff users.
            </p>
            {isAdmin && (
              <button className="btn btn-primary" onClick={onAddDealership}>
                <PlusIcon size={16} /> Create Your First Dealership Branch
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Dealership Branch</th>
                    <th>Branch Code</th>
                    <th>City / Location</th>
                    <th>Manager Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDealerships.map((d, idx) => (
                    <tr key={d._id || d.id || idx}>
                      <td style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', width: '40px' }}>
                        {indexOfFirstItem + idx + 1}
                      </td>
                      <td>
                        <div className="entity-cell">
                          <div className="entity-initial" style={{ background: 'var(--purple-bg)', color: 'var(--purple)' }}>
                            🏢
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{d.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Branch ID: {d._id || d.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="stat-badge badge-purple" style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                          {d.code || 'DL-BRANCH'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        📍 {d.city || 'Main'}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                          📧 {d.managerEmail || 'manager@autoaudit.in'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {d.phone || '—'}
                      </td>
                      <td>
                        <span className="stat-badge badge-green">● Active Branch</span>
                      </td>
                      <td>
                        {isAdmin ? (
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                              onClick={() => onEditDealership && onEditDealership(d)}
                              title="Edit dealership details"
                            >
                              <EditIcon size={13} /> Edit
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ color: 'var(--coral)', borderColor: 'var(--coral-border)', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                              onClick={() => onDeleteDealership && onDeleteDealership(d._id || d.id)}
                              title="Delete dealership branch"
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
            <Pagination
              currentPage={currentPage}
              totalItems={filteredDealerships.length}
              itemsPerPage={itemsPerPage}
              onPageChange={page => setCurrentPage(page)}
            />
          </>
        )}
      </div>
    </div>
  );
}
