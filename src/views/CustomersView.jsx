import React, { useState } from 'react';
import { PlusIcon, TrashIcon, EditIcon, CarIcon, MicIcon, ExternalLinkIcon } from '../components/Icons';
import Pagination from '../components/Pagination';

export default function CustomersView({
  customers = [],
  onNewCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onViewCustomerComplaints,
  searchQuery = ''
}) {
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = safeCustomers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers &amp; Vehicle Database</h1>
          <p className="page-subtitle">
            Vehicle owner records and service center history
            {searchQuery && <span className="search-hint">Filtering: "{searchQuery}" — {safeCustomers.length} result{safeCustomers.length !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <button className="btn btn-primary" onClick={onNewCustomer}>
          <PlusIcon size={14} /> New Customer
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {safeCustomers.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <div style={{
              width: '52px', height: '52px', background: 'var(--primary-soft)', border: 'var(--border)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem'
            }}>
              <CarIcon size={26} />
            </div>
            <div className="empty-state-msg" style={{ fontSize: '1rem', fontWeight: 600 }}>
              {searchQuery ? `No customer records match "${searchQuery}"` : 'No registered customers found'}
            </div>
            <div className="empty-state-sub" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              {searchQuery ? 'A search filter from another view is currently active.' : 'Register your first customer to generate single-use feedback links'}
            </div>
            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={onNewCustomer}>
                <PlusIcon size={14} /> Register New Customer
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    <th>Vehicle</th>
                    <th>Contact</th>
                    <th>Service Center</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCustomers.map((c, idx) => {
                    if (!c) return null;
                    const custName = c.name || 'Unnamed Customer';
                    const initial = (custName[0] || '?').toUpperCase();
                    const vNum = c.vehicleNumber || c.vehicle_number || 'N/A';
                    const vModel = c.vehicleModel || c.vehicle_model || 'Standard';
                    const contact = c.mobile || c.phone || c.email || '—';
                    const branch = c.serviceCenter || c.service_center || 'Downtown Branch';
                    const custId = c._id || c.id || `c_${idx}`;

                    return (
                      <tr key={custId}>
                        <td style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', width: '40px' }}>
                          {indexOfFirstItem + idx + 1}
                        </td>
                        <td>
                          <div className="entity-cell">
                            <div className="entity-initial">{initial}</div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{custName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{c.email || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.05em' }}>
                              {vNum}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{vModel}</div>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.825rem' }}>{contact}</td>
                        <td>
                          <span className="stat-badge badge-gray">{branch}</span>
                        </td>
                        <td>
                          <span className="stat-badge badge-green">Active</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              onClick={() => onViewCustomerComplaints && onViewCustomerComplaints(c)}
                              title="View voice notes & AI audit results for this vehicle"
                            >
                              <MicIcon size={12} /> Audits <ExternalLinkIcon size={11} />
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                              onClick={() => onEditCustomer && onEditCustomer(c)}
                              title="Edit customer record"
                            >
                              <EditIcon size={13} /> Edit
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ color: 'var(--coral)', borderColor: 'var(--coral-border)', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                              onClick={() => onDeleteCustomer && onDeleteCustomer(custId)}
                              title="Delete customer record"
                            >
                              <TrashIcon size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={safeCustomers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={page => setCurrentPage(page)}
            />
          </>
        )}
      </div>
    </div>
  );
}
