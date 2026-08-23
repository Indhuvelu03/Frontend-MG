import React, { useState } from 'react';
import { XIcon, PlusIcon, TrashIcon, EditIcon, EyeIcon, EyeOffIcon } from './Icons';

// Reusable Modal wrapper
export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <XIcon size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmModal({ title = 'Confirm action', message, confirmLabel = 'Confirm', onClose, onConfirm }) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="confirm-modal-copy">{message}</div>
      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="button" className="btn btn-danger" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}

// Create / Edit Customer Modal
export function CustomerModal({ onClose, custForm, setCustForm, onSubmit, serviceCenters = [], isEditing = false, loading = false }) {
  return (
    <Modal title={isEditing ? "Edit Customer Record" : "Register Customer Record"} onClose={onClose}>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label className="form-label">Customer Name</label>
          <input
            type="text"
            className="form-input"
            value={custForm.name}
            onChange={e => setCustForm({ ...custForm, name: e.target.value })}
            placeholder="e.g. Ramesh Kumar"
            required
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input
              type="text"
              className="form-input"
              value={custForm.mobile}
              onChange={e => setCustForm({ ...custForm, mobile: e.target.value })}
              placeholder="e.g. 9876543210"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address <span style={{ color: 'var(--coral)' }}>*</span></label>
            <input
              type="email"
              className="form-input"
              value={custForm.email}
              onChange={e => setCustForm({ ...custForm, email: e.target.value })}
              placeholder="e.g. ramesh@example.com"
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Vehicle Number</label>
            <input
              type="text"
              className="form-input"
              value={custForm.vehicleNumber}
              onChange={e => setCustForm({ ...custForm, vehicleNumber: e.target.value })}
              placeholder="e.g. KA01AB1234"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Vehicle Model</label>
            <input
              type="text"
              className="form-input"
              value={custForm.vehicleModel}
              onChange={e => setCustForm({ ...custForm, vehicleModel: e.target.value })}
              placeholder="e.g. Honda City"
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Service Center Branch</label>
          <select
            className="form-select"
            value={custForm.serviceCenter || (serviceCenters[0]?.name || 'Downtown Branch')}
            onChange={e => setCustForm({ ...custForm, serviceCenter: e.target.value })}
            required
          >
            {serviceCenters.map(s => (
              <option key={s.id} value={s.name}>
                {s.name} ({s.location})
              </option>
            ))}
          </select>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (isEditing ? 'Saving & scheduling email…' : 'Creating & scheduling email…') : (isEditing ? 'Save Customer Record' : 'Create Customer & Send Invite')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Generate Feedback Token Modal
export function LinkModal({ onClose, customers = [], selectedCustomerId, setSelectedCustomerId, onSubmit }) {
  const hasCustomers = customers.length > 0;

  return (
    <Modal title="Generate Feedback Token" onClose={onClose}>
      <form onSubmit={onSubmit}>
        {!hasCustomers && (
          <div style={{
            padding: '0.75rem 1rem',
            background: 'var(--amber-bg)',
            border: '1px solid var(--amber-border)',
            fontSize: '0.8rem',
            color: 'var(--amber-dark)',
            fontWeight: 700,
            marginBottom: '1rem',
          }}>
            ⚠️ No customer records registered yet. Please create a customer record first.
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Select Customer Record</label>
          <select
            className="form-select"
            value={selectedCustomerId}
            onChange={e => setSelectedCustomerId(e.target.value)}
            disabled={!hasCustomers}
          >
            {hasCustomers ? (
              customers.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.vehicleNumber} - {c.vehicleModel || 'Vehicle'})
                </option>
              ))
            ) : (
              <option value="">-- No registered customers available --</option>
            )}
          </select>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={!hasCustomers}>
            Generate Public Token
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Upload Invoice PDF Modal
export function InvoiceModal({ onClose, complaints = [], customers = [], selectedComplaintId, setSelectedComplaintId, setInvoiceFile, onSubmit, getCustName }) {
  const hasComplaints = complaints.length > 0;
  const hasCustomers = customers.length > 0;

  return (
    <Modal title="Upload Repair Invoice PDF" onClose={onClose}>
      <form onSubmit={onSubmit}>
        {!hasComplaints && (
          <div style={{
            padding: '0.75rem 1rem',
            background: 'var(--amber-bg)',
            border: '1px solid var(--amber-border)',
            fontSize: '0.8rem',
            color: 'var(--amber-dark)',
            fontWeight: 700,
            marginBottom: '1rem',
          }}>
            ⚠️ No voice complaint records submitted yet. You can select a registered customer vehicle below or submit customer voice feedback first.
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Select Customer / Vehicle Record</label>
          <select
            className="form-select"
            value={selectedComplaintId}
            onChange={e => setSelectedComplaintId(e.target.value)}
          >
            {hasComplaints ? (
              complaints.map(c => (
                <option key={c._id} value={c._id}>
                  {c.vehicleNumber} — {getCustName ? getCustName(c.customerId) : 'Customer'}
                </option>
              ))
            ) : hasCustomers ? (
              customers.map(c => (
                <option key={c._id} value={c._id}>
                  {c.vehicleNumber} — {c.name} ({c.vehicleModel})
                </option>
              ))
            ) : (
              <option value="">-- No vehicle records available --</option>
            )}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Service Invoice PDF File</label>
          <input
            type="file"
            className="form-input"
            accept=".pdf"
            onChange={e => setInvoiceFile(e.target.files[0])}
            required
          />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={!hasCustomers && !hasComplaints}>
            Upload &amp; Run AI Audit
          </button>
        </div>
      </form>
    </Modal>
  );
}



// Super Admin: Add/Edit Service Center Modal
export function ServiceCenterModal({ onClose, onSave, editingCenter = null }) {
  const [name, setName] = useState(editingCenter?.name || '');
  const [location, setLocation] = useState(editingCenter?.location || '');
  const [managerEmail, setManagerEmail] = useState(editingCenter?.managerEmail || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    onSave(name, location, managerEmail, editingCenter?.id);
    onClose();
  };

  return (
    <Modal title={editingCenter ? "Edit Service Center Branch" : "Add New Service Center Branch"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Branch Name</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Downtown Branch"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Location / City</label>
          <input
            type="text"
            className="form-input"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Bangalore Central"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Branch Manager Email (For AI Fraud &amp; Escalation Alerts)</label>
          <input
            type="email"
            className="form-input"
            value={managerEmail}
            onChange={e => setManagerEmail(e.target.value)}
            placeholder="e.g. manager.downtown@autoaudit.in"
            required
          />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">
            {editingCenter ? "Update Branch" : "Add Service Center"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Create Staff Account Modal
export function UserModal({ onClose, userForm, setUserForm, onSubmit, loading = false, error = '' }) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Modal title="Create Staff System Account" onClose={onClose}>
      <form onSubmit={onSubmit}>
        {error && (
          <div style={{ padding: '0.65rem 0.85rem', marginBottom: '1rem', background: 'var(--coral-bg)', border: '1px solid var(--coral-border)', color: 'var(--coral)', fontSize: '0.8rem', fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-input"
            value={userForm.name}
            onChange={e => setUserForm({ ...userForm, name: e.target.value })}
            placeholder="e.g. Anand Kumar"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-input"
            value={userForm.email}
            onChange={e => setUserForm({ ...userForm, email: e.target.value })}
            placeholder="e.g. anand@autoaudit.in"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="password-input-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              value={userForm.password}
              onChange={e => setUserForm({ ...userForm, password: e.target.value })}
              placeholder="Minimum 6 characters"
              required
              minLength={6}
            />
            <button type="button" className="password-toggle" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Assigned Role</label>
          <select
            className="form-select"
            value={userForm.role}
            onChange={e => setUserForm({ ...userForm, role: e.target.value })}
          >
            <option value="STAFF">👤 Service Advisor (Staff Access)</option>
            <option value="ADMIN">🛡️ Super Admin (Full Access)</option>
          </select>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating Account…" : "Create Account"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function EditUserModal({ user, onClose, onSave }) {
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState(user?.role || 'STAFF');
  return (
    <Modal title="Edit Staff Account" onClose={onClose}>
      <form onSubmit={(event) => { event.preventDefault(); onSave({ ...user, name, role }); }}>
        <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={name} onChange={e => setName(e.target.value)} required /></div>
        <div className="form-group"><label className="form-label">Assigned Role</label><select className="form-select" value={role} onChange={e => setRole(e.target.value)}><option value="STAFF">Service Advisor</option><option value="ADMIN">Super Admin</option></select></div>
        <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" type="submit">Save Changes</button></div>
      </form>
    </Modal>
  );
}
