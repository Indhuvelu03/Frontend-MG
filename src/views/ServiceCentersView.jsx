import React, { useState } from 'react';
import { PlusIcon, TrashIcon, EditIcon, BuildingIcon, MailIcon, PhoneIcon, ShieldIcon, SearchIcon } from '../components/Icons';
import { Modal } from '../components/Modals';

export default function ServiceCentersView({
  serviceCenters = [],
  onAddServiceCenter,
  onUpdateServiceCenter,
  onDeleteServiceCenter,
  searchQuery = ''
}) {
  const [localSearch, setLocalSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCenter, setEditingCenter] = useState(null);
  const [form, setForm] = useState({
    name: '',
    branch: '',
    phone: '+91 ',
    managerEmail: ''
  });
  const [saving, setSaving] = useState(false);

  const query = (searchQuery || localSearch).toLowerCase().trim();
  const filteredCenters = serviceCenters.filter(s => {
    if (!query) return true;
    return (
      (s.name || '').toLowerCase().includes(query) ||
      (s.branch || s.location || '').toLowerCase().includes(query) ||
      (s.phone || '').toLowerCase().includes(query) ||
      (s.managerEmail || s.manager_email || '').toLowerCase().includes(query)
    );
  });

  const handleOpenAdd = () => {
    setEditingCenter(null);
    setForm({ name: '', branch: '', phone: '+91 ', managerEmail: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (sc) => {
    setEditingCenter(sc);
    setForm({
      name: sc.name || '',
      branch: sc.branch || sc.location || '',
      phone: sc.phone || '+91 ',
      managerEmail: sc.managerEmail || sc.manager_email || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCenter) {
        await onUpdateServiceCenter(editingCenter.id || editingCenter._id, form);
      } else {
        await onAddServiceCenter(form);
      }
      setShowModal(false);
    } catch (err) {
      alert(err.message || 'Failed to save service center branch');
    } finally {
      setSaving(false);
    }
  };

  const withEmailCount = serviceCenters.filter(s => Boolean(s.managerEmail || s.manager_email)).length;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Service Center Branches</h1>
          <p className="page-subtitle">
            Manage service workshops for your dealership and configure branch manager email escalation targets.
            {query && <span className="search-hint"> · Filtering "{query}" — {filteredCenters.length} branch{filteredCenters.length !== 1 ? 'es' : ''}</span>}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <PlusIcon size={15} /> Add Service Center
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#fff', border: '1px solid #E4E4E7', borderRadius: '8px', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
            Total Workshops
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#18181B' }}>{serviceCenters.length}</div>
          <div style={{ fontSize: '0.78rem', color: '#71717A', marginTop: '0.2rem' }}>Registered service locations</div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E4E4E7', borderRadius: '8px', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
            Branch Managers
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#18181B' }}>{withEmailCount}</div>
          <div style={{ fontSize: '0.78rem', color: '#71717A', marginTop: '0.2rem' }}>Escalation contacts configured</div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E4E4E7', borderRadius: '8px', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
            Auto Escalation
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669' }}>Active</div>
          <div style={{ fontSize: '0.78rem', color: '#71717A', marginTop: '0.2rem' }}>Manager alert on score &lt; 60%</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div style={{ background: '#fff', border: '1px solid #E4E4E7', borderRadius: '8px', overflow: 'hidden' }}>
        {/* Table Header Bar with Search */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #E4E4E7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#18181B' }}>
            Registered Workshop Branches <span style={{ fontSize: '0.78rem', color: '#A1A1AA', fontWeight: 400 }}>({filteredCenters.length})</span>
          </span>

          <div style={{ position: 'relative', width: '280px' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#A1A1AA', display: 'flex', alignItems: 'center' }}>
              <SearchIcon size={14} />
            </span>
            <input
              type="text"
              placeholder="Search branch, phone or manager email..."
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '32px',
                paddingRight: '12px',
                paddingTop: '6px',
                paddingBottom: '6px',
                fontSize: '0.8rem',
                border: '1px solid #E4E4E7',
                borderRadius: '6px',
                outline: 'none',
                background: '#FAFAFA'
              }}
            />
          </div>
        </div>

        {/* Table */}
        {filteredCenters.length === 0 ? (
          <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: '#A1A1AA' }}>
              <BuildingIcon size={40} />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#18181B', marginBottom: '0.5rem' }}>
              {query ? `No service centers match "${query}"` : 'No Service Centers Created Yet'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#71717A', maxWidth: 400, margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
              Add your service workshop locations and manager email contacts to enable automated mismatch escalations.
            </p>
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              <PlusIcon size={15} /> Add First Service Center
            </button>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Service Center Name</th>
                <th>Branch Location</th>
                <th>Contact Phone</th>
                <th>Manager Email (Escalation)</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCenters.map((sc, idx) => {
                const managerEmail = sc.managerEmail || sc.manager_email;
                return (
                  <tr key={sc.id || sc._id || idx}>
                    <td style={{ color: '#A1A1AA', fontSize: '0.75rem' }}>{idx + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '6px',
                          background: '#EFF6FF', color: '#2563EB',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: '0.75rem', flexShrink: 0
                        }}>
                          <BuildingIcon size={16} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#18181B' }}>{sc.name}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#F4F4F5', color: '#3F3F46', border: '1px solid #E4E4E7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        {sc.branch || sc.location || 'Main Branch'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#52525B', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <PhoneIcon size={13} style={{ color: '#A1A1AA' }} />
                        {sc.phone || '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: managerEmail ? '#2563EB' : '#A1A1AA', fontWeight: managerEmail ? 600 : 400, display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <MailIcon size={13} />
                        {managerEmail || 'Not configured'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '0.15rem 0.55rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldIcon size={11} /> Auto Escalation On
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          className="btn-icon"
                          onClick={() => handleOpenEdit(sc)}
                          title="Edit branch details"
                          style={{ padding: '0.35rem', background: '#F4F4F5', border: '1px solid #E4E4E7', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          <EditIcon size={14} />
                        </button>
                        <button
                          className="btn-icon danger"
                          onClick={() => {
                            if (window.confirm(`Delete service center "${sc.name}"?`)) {
                              onDeleteServiceCenter(sc.id || sc._id);
                            }
                          }}
                          title="Delete branch"
                          style={{ padding: '0.35rem', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Service Center Modal */}
      {showModal && (
        <Modal title={editingCenter ? 'Edit Service Center Branch' : 'Add New Service Center Branch'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#27272A', marginBottom: '0.35rem' }}>
                Service Center Name <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Downtown AutoCare Workshop"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', background: '#FAFAFA', border: '1px solid #E4E4E7', borderRadius: '6px', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#27272A', marginBottom: '0.35rem' }}>
                Branch / Location <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Vellore North Branch"
                value={form.branch}
                onChange={e => setForm({ ...form, branch: e.target.value })}
                required
                style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', background: '#FAFAFA', border: '1px solid #E4E4E7', borderRadius: '6px', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#27272A', marginBottom: '0.35rem' }}>
                Contact Phone Number
              </label>
              <input
                type="tel"
                className="form-control"
                placeholder="e.g. +91 9876543210"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', background: '#FAFAFA', border: '1px solid #E4E4E7', borderRadius: '6px', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#27272A', marginBottom: '0.35rem' }}>
                Branch Manager Email ID (Escalation Target) <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="e.g. manager.north@autocare.com"
                value={form.managerEmail}
                onChange={e => setForm({ ...form, managerEmail: e.target.value })}
                required
                style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', background: '#FAFAFA', border: '1px solid #E4E4E7', borderRadius: '6px', fontSize: '0.875rem' }}
              />
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '0.55rem 0.75rem', marginTop: '0.45rem', fontSize: '0.75rem', color: '#1E40AF', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <ShieldIcon size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>Automated fraud & discrepancy email alerts will be sent directly to this manager whenever AI detects an audit mismatch (score &lt; 60%).</span>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : (editingCenter ? 'Save Branch Details' : 'Add Service Center')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
