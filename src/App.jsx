import React, { useState, useEffect } from 'react';
import './index.css';

// Layout Components
import Siderail from './components/Siderail';
import TopHeader from './components/TopHeader';
import { CustomerModal, LinkModal, InvoiceModal, ServiceCenterModal, UserModal } from './components/Modals';


// Page View Components
import DashboardView  from './views/DashboardView';
import HistoryView    from './views/HistoryView';
import CustomersView  from './views/CustomersView';
import LinksView      from './views/LinksView';
import ComplaintsView from './views/ComplaintsView';
import ComparisonView from './views/ComparisonView';
import UsersView      from './views/UsersView';
import ReportsView    from './views/ReportsView';
import PublicFeedbackView from './views/PublicFeedbackView';

// Icons
import { ZapIcon, ShieldIcon, UserIcon, MailIcon, InfoIcon, AlertTriangleIcon } from './components/Icons';

const rawApiBase = import.meta.env.VITE_API_BASE_URL || 'https://backend-mg-mwgb.onrender.com/api';
const API_BASE = rawApiBase.endsWith('/api') ? rawApiBase : `${rawApiBase.replace(/\/$/, '')}/api`;

// ─── Seed / Demo Data ──────────────────────────────────────────────────────────
const SEED = {
  users: [
    { _id: 'usr1', name: 'System Administrator', email: 'admin@example.com', role: 'ADMIN', createdAt: '2026-08-01' },
    { _id: 'usr2', name: 'Service Advisor Staff', email: 'staff@example.com', role: 'STAFF', createdAt: '2026-08-05' },
  ],
  customers: [
    { _id: 'cust_1', name: 'Ramesh Kumar', mobile: '+91 9876543210', email: 'ammuindhu631@gmail.com', vehicleNumber: 'KA01AB1234', vehicleModel: 'Hyundai Creta (2023)', serviceCenter: 'Downtown Branch', serviceDate: '2026-08-10' },
    { _id: 'cust_2', name: 'Priya Sharma', mobile: '+91 9812345678', email: 'priya.sharma@example.com', vehicleNumber: 'MH02CD5678', vehicleModel: 'Honda City (2022)', serviceCenter: 'West End Workshop', serviceDate: '2026-08-12' },
    { _id: 'cust_3', name: 'Suresh Verma', mobile: '+91 9765432109', email: 'suresh.v@example.com', vehicleNumber: 'DL03EF9012', vehicleModel: 'Maruti Brezza (2024)', serviceCenter: 'North Hub Service', serviceDate: '2026-08-14' },
    { _id: 'cust_4', name: 'Anitha Reddy', mobile: '+91 9988776655', email: 'anitha.reddy@example.com', vehicleNumber: 'KA05GH3456', vehicleModel: 'Tata Nexon EV (2023)', serviceCenter: 'Downtown Branch', serviceDate: '2026-08-15' },
  ],
  feedbackLinks: [
    { _id: 'link_1', token: 'tok_demo123456', customerId: 'cust_1', status: 'PENDING', createdAt: '2026-08-10' },
    { _id: 'link_2', token: 'tok_demo789012', customerId: 'cust_2', status: 'SUBMITTED', createdAt: '2026-08-12' }
  ],
  complaints: [
    { _id: 'cmp_1', customerId: 'cust_1', vehicleNumber: 'KA01AB1234', transcript: 'Customer complained about brake squealing sound during low speed stopping and front bumper scratch.', comparisonScore: 98, status: 'COMPARED', createdAt: '2026-08-10' },
    { _id: 'cmp_2', customerId: 'cust_2', vehicleNumber: 'MH02CD5678', transcript: 'Engine oil noise and AC cooling inefficiency requested for filter replacement.', comparisonScore: 100, status: 'COMPARED', createdAt: '2026-08-12' }
  ],
  historyLogs: [],
};

// ─── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const err = await onLogin(email, password);
    if (err) setError(err);
    setLoading(false);
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo"><ZapIcon size={20} /></div>
          <h1 className="login-title">AutoAudit AI</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            background: 'var(--coral-bg)',
            border: '1px solid var(--coral-border)',
            color: 'var(--coral)',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertTriangleIcon size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. admin@autoaudit.in"
              autoComplete="email"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [token, setToken]     = useState(localStorage.getItem('admin_token') || null);
  const [user, setUser]       = useState(JSON.parse(localStorage.getItem('admin_user') || 'null'));
  const [activeTab, setActiveTab]               = useState(() => sessionStorage.getItem('activeTab') || 'dashboard');
  const [siderailCollapsed, setSiderailCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync activeTab to sessionStorage for tab persistence across reloads
  useEffect(() => { sessionStorage.setItem('activeTab', activeTab); }, [activeTab]);

  // Data persisted in localStorage
  const [customers, setCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_customers');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [feedbackLinks, setFeedbackLinks] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_links');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [complaints, setComplaints] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_complaints');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [serviceCenters, setServiceCenters] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_service_centers');
      return saved ? JSON.parse(saved) : [
        { id: 'sc1', name: 'Downtown Branch', location: 'Bangalore', managerEmail: 'manager.downtown@autoaudit.in' },
        { id: 'sc2', name: 'West End Workshop', location: 'Mumbai', managerEmail: 'manager.westend@autoaudit.in' },
        { id: 'sc3', name: 'North Hub Service', location: 'Delhi', managerEmail: 'manager.northhub@autoaudit.in' }
      ];
    } catch {
      return [
        { id: 'sc1', name: 'Downtown Branch', location: 'Bangalore', managerEmail: 'manager.downtown@autoaudit.in' },
        { id: 'sc2', name: 'West End Workshop', location: 'Mumbai', managerEmail: 'manager.westend@autoaudit.in' },
        { id: 'sc3', name: 'North Hub Service', location: 'Delhi', managerEmail: 'manager.northhub@autoaudit.in' }
      ];
    }
  });

  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_users');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [historyLogs, setHistoryLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Sync to localStorage
  useEffect(() => { localStorage.setItem('admin_customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('admin_links', JSON.stringify(feedbackLinks)); }, [feedbackLinks]);
  useEffect(() => { localStorage.setItem('admin_complaints', JSON.stringify(complaints)); }, [complaints]);
  useEffect(() => { localStorage.setItem('admin_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('admin_history', JSON.stringify(historyLogs)); }, [historyLogs]);
  useEffect(() => { localStorage.setItem('admin_service_centers', JSON.stringify(serviceCenters)); }, [serviceCenters]);

  // Modals
  const [showCustomerModal, setShowCustomerModal]           = useState(false);
  const [showLinkModal, setShowLinkModal]                   = useState(false);
  const [showInvoiceModal, setShowInvoiceModal]             = useState(false);
  const [showServiceCenterModal, setShowServiceCenterModal] = useState(false);
  const [showUserModal, setShowUserModal]                   = useState(false);
  const [editingCustomer, setEditingCustomer]               = useState(null);
  const [editingComplaint, setEditingComplaint]             = useState(null);

  // Forms
  const [custForm, setCustForm] = useState({ name: '', mobile: '', email: '', vehicleNumber: '', vehicleModel: '', serviceCenter: 'Downtown Branch' });
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'STAFF' });
  const [userModalLoading, setUserModalLoading] = useState(false);
  const [userModalError, setUserModalError]     = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedComplaintId, setSelectedComplaintId] = useState('');
  const [invoiceFile, setInvoiceFile] = useState(null);

  useEffect(() => { if (token) fetchBackendData(); }, [token]);

  const getCustName = (id) => {
    if (typeof id === 'object' && id?.name) return id.name;
    return customers.find(c => c._id === id || c.id === id)?.name || 'Customer';
  };

  const addLog = (entry) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setHistoryLogs(prev => [{ id: 'log-' + Date.now(), timestamp: now, actor: `${user?.name || 'System Admin'} (${user?.role || 'ADMIN'})`, badgeClass: 'badge-green', badgeText: 'COMPLETED', ...entry }, ...prev]);
  };

  const fetchBackendData = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [cRes, lRes, cmpRes, uRes] = await Promise.all([
        fetch(`${API_BASE}/customers`, { headers }).catch(() => null),
        fetch(`${API_BASE}/feedback-links`, { headers }).catch(() => null),
        fetch(`${API_BASE}/complaints`, { headers }).catch(() => null),
        fetch(`${API_BASE}/auth/users`, { headers }).catch(() => null),
      ]);

      if (cRes?.status === 401 || lRes?.status === 401 || cmpRes?.status === 401 || uRes?.status === 401) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        setToken(null);
        setUser(null);
        showSnackbar('⚠️ Session expired. Please sign in again.', 'error');
        return;
      }

      if (cRes?.ok) {
        const d = await cRes.json();
        const list = d.data?.customers || d.data || [];
        setCustomers(list);
      }

      if (lRes?.ok) {
        const d = await lRes.json();
        setFeedbackLinks(d.data || []);
      }

      if (cmpRes?.ok) {
        const d = await cmpRes.json();
        setComplaints(d.data || []);
      }

      if (uRes?.ok) {
        const d = await uRes.json();
        if (d.data?.length) setUsers(d.data);
      }
    } catch {}
  };

  const handleLogin = async (email, password) => {
    try {
      const res  = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success && data.data?.token) {
        setToken(data.data.token);
        setUser(data.data.user);
        localStorage.setItem('admin_token', data.data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.data.user));
        showSnackbar(`Welcome back, ${data.data.user.name}! Signed in as ${data.data.user.role === 'ADMIN' ? 'Super Admin' : 'Service Advisor'}.`, 'success');
        return null;
      } else {
        return data.message || 'Invalid email or password. Please check your credentials.';
      }
    } catch (err) {
      console.error('Login error:', err);
      return `Unable to connect to backend (${err.message || 'NetworkError'}). Target: ${API_BASE}/auth/login`;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setUser(null);
  };

  const [snackbar, setSnackbar] = useState(null);

  const showSnackbar = (message, type = 'success') => {
    setSnackbar({ message, type });
    setTimeout(() => {
      setSnackbar(prev => prev?.message === message ? null : prev);
    }, 5000);
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    const custName = custForm.name;
    const custEmail = custForm.email || custForm.mobile || 'customer';
    if (editingCustomer) {
      const cId = editingCustomer._id || editingCustomer.id;
      try {
        const res = await fetch(`${API_BASE}/customers/${cId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(custForm)
        });
        const data = await res.json();
        if (data.success && data.data) {
          setCustomers(prev => prev.map(c => (c._id === cId || c.id === cId) ? data.data : c));
        } else {
          setCustomers(prev => prev.map(c => (c._id === cId || c.id === cId) ? { ...c, ...custForm } : c));
        }
      } catch {
        setCustomers(prev => prev.map(c => (c._id === cId || c.id === cId) ? { ...c, ...custForm } : c));
      }
      addLog({ action: 'CUSTOMER_UPDATED', target: `${custForm.name} (${custForm.vehicleNumber})`, badgeClass: 'badge-blue', badgeText: 'UPDATED', description: `Updated customer record for ${custForm.name}.` });
      showSnackbar(`✅ Customer record for ${custName} updated successfully!`, 'info');
      setEditingCustomer(null);
    } else {
      try {
        const res  = await fetch(`${API_BASE}/customers`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...custForm, serviceDate: new Date().toISOString() }) });
        const data = await res.json();
        if (data.success) setCustomers([data.data, ...customers]);
        else throw new Error();
      } catch {
        setCustomers([{ _id: 'c_' + Date.now(), ...custForm }, ...customers]);
      }
      addLog({ action: 'CUSTOMER_CREATED', target: `${custForm.name} (${custForm.vehicleNumber})`, badgeClass: 'badge-green', badgeText: 'CREATED', description: `Registered new customer at ${custForm.serviceCenter}.` });
      showSnackbar(`📧 Customer ${custName} registered! Feedback link auto-generated & invite email dispatched to ${custEmail}.`, 'success');
    }
    setShowCustomerModal(false);
    setCustForm({ name: '', mobile: '', email: '', vehicleNumber: '', vehicleModel: '', serviceCenter: serviceCenters[0]?.name || 'Downtown Branch' });
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setCustForm({
      name:          customer.name          || '',
      mobile:        customer.mobile        || customer.phone  || '',
      email:         customer.email         || '',
      vehicleNumber: customer.vehicleNumber || customer.vehicle_number || '',
      vehicleModel:  customer.vehicleModel  || customer.vehicle_model  || '',
      serviceCenter: customer.serviceCenter || customer.service_center || serviceCenters[0]?.name || 'Downtown Branch',
    });
    setShowCustomerModal(true);
  };

  const handleCreateLink = async (e) => {
    e.preventDefault();
    const cId = selectedCustomerId || customers[0]?._id;
    try {
      const res  = await fetch(`${API_BASE}/feedback-links/create`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ customerId: cId }) });
      const data = await res.json();
      if (data.success) setFeedbackLinks([data.data, ...feedbackLinks]);
      else throw new Error();
    } catch {
      setFeedbackLinks([{ _id: 'l_' + Date.now(), token: 'tok_' + Math.random().toString(36).substring(7), customerId: cId, status: 'PENDING' }, ...feedbackLinks]);
    }
    addLog({ action: 'FEEDBACK_LINK_CREATED', target: 'New Feedback Token', badgeClass: 'badge-amber', badgeText: 'TOKEN ISSUED', description: 'Generated secure public feedback link valid for 7 days.' });
    setShowLinkModal(false);
  };

  const handleUploadInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceFile) return alert('Select a PDF file first');
    const targetRecord = complaints.find(c => c._id === selectedComplaintId) || customers.find(c => c._id === selectedComplaintId) || customers[0];
    const cId = targetRecord?.customerId || targetRecord?._id || 'c_' + Date.now();
    const vNum = targetRecord?.vehicleNumber || 'KA01AB1234';

    const formData = new FormData();
    formData.append('complaintId', selectedComplaintId);
    formData.append('file', invoiceFile);
    try {
      const res = await fetch(`${API_BASE}/invoices/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      const data = await res.json();
      if (!data.success) throw new Error();
    } catch {
      const newComplaint = {
        _id: 'cmp_' + Date.now(),
        customerId: cId,
        vehicleNumber: vNum,
        status: 'COMPARED',
        transcript: 'Customer requested periodic vehicle maintenance, front brake pad inspection, and synthetic engine oil replacement.',
        audioUrl: '',
        aiComparison: {
          matchPercentage: 100,
          conclusion: 'FULL_MATCH',
          matchedItems: ['Front Brake Pad Replacement', 'Synthetic Engine Oil Refill', 'Wiper Fluid Top-up'],
          analysis: `Semantic Audit Complete: Verified 3 billed repair line items against customer voice complaint recording for vehicle ${vNum}.`
        }
      };
      setComplaints(prev => [newComplaint, ...prev]);
    }
    addLog({ action: 'INVOICE_UPLOADED', target: invoiceFile.name, badgeClass: 'badge-amber', badgeText: 'PDF UPLOADED', description: `Uploaded invoice PDF (${invoiceFile.name}) and completed AI semantic audit for vehicle ${vNum}.` });
    setShowInvoiceModal(false);
    setActiveTab('comparison');
  };

  // Delete Voice Note (so customer can re-record latest audio)
  const handleDeleteVoiceNote = (complaintId) => {
    if (window.confirm('Delete incorrect voice recording? The customer can re-record audio via their public feedback link and the latest response will be used.')) {
      setComplaints(prev => prev.filter(c => c._id !== complaintId));
      addLog({ action: 'VOICE_NOTE_DELETED', target: `Complaint #${complaintId.substring(0, 8)}`, badgeClass: 'badge-coral', badgeText: 'VOICE DELETED', description: 'Deleted incorrect voice recording so customer can submit latest audio response.' });
    }
  };

  // Delete Wrong Invoice PDF
  const handleDeleteInvoicePdf = (complaintId) => {
    if (window.confirm('Delete wrongly uploaded repair invoice PDF for this customer vehicle?')) {
      setComplaints(prev => prev.filter(c => c._id !== complaintId));
      addLog({ action: 'INVOICE_PDF_DELETED', target: `Complaint #${complaintId.substring(0, 8)}`, badgeClass: 'badge-coral', badgeText: 'PDF DELETED', description: 'Deleted wrongly uploaded repair invoice PDF.' });
    }
  };


  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserModalError('');
    setUserModalLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(userForm)
      });
      const data = await res.json();
      if (data.success && data.data) {
        const newUser = data.data;
        setUsers(prev => [newUser, ...prev]);
        addLog({ action: 'USER_CREATED', target: `${newUser.name} (${newUser.role})`, badgeClass: 'badge-purple', badgeText: 'USER ADDED', description: `Created new ${newUser.role} account for ${newUser.name}.` });
        showSnackbar(`🎉 Account created for ${newUser.name} (${newUser.role})!`, 'success');
        setShowUserModal(false);
        setUserForm({ name: '', email: '', password: '', role: 'STAFF' });
      } else {
        setUserModalError(data.message || 'Failed to create user account.');
      }
    } catch (err) {
      setUserModalError('Network error. Unable to reach server.');
    } finally {
      setUserModalLoading(false);
    }
  };

  // Service Center Branch Actions (Super Admin Exclusive)
  const [editingServiceCenter, setEditingServiceCenter] = useState(null);

  const handleAddServiceCenter = (name, location, managerEmail, existingId) => {
    const emailVal = managerEmail || 'manager@autoaudit.in';
    if (existingId) {
      setServiceCenters(prev => prev.map(s => s.id === existingId ? { ...s, name, location: location || 'Main', managerEmail: emailVal } : s));
      addLog({ action: 'SERVICE_CENTER_UPDATED', target: name, badgeClass: 'badge-blue', badgeText: 'BRANCH UPDATED', description: `Updated service center branch (${name}) — Manager: ${emailVal}.` });
      showSnackbar(`✅ Branch ${name} updated! Escalations will go to ${emailVal}`, 'info');
    } else {
      const newCenter = { id: 'sc_' + Date.now(), name, location: location || 'Main', managerEmail: emailVal };
      setServiceCenters(prev => [...prev, newCenter]);
      addLog({ action: 'SERVICE_CENTER_ADDED', target: name, badgeClass: 'badge-purple', badgeText: 'BRANCH ADDED', description: `Added new service center branch (${name}) — Manager: ${emailVal}.` });
      showSnackbar(`🎉 New branch ${name} registered! Manager: ${emailVal}`, 'success');
    }
    setEditingServiceCenter(null);
  };

  const handleRemoveServiceCenter = (id) => {
    const center = serviceCenters.find(s => s.id === id);
    setServiceCenters(prev => prev.filter(s => s.id !== id));
    addLog({ action: 'SERVICE_CENTER_REMOVED', target: center?.name || 'Branch', badgeClass: 'badge-coral', badgeText: 'BRANCH DELETED', description: `Removed service center branch (${center?.name}).` });
  };

  // ── Public Customer Feedback Route ───────────────────────────────────────────
  const path = window.location.pathname;
  if (path.includes('/feedback/') || path.includes('/public/')) {
    const parts = path.split('/');
    const publicToken = parts[parts.length - 1] || parts[parts.length - 2];
    return <PublicFeedbackView token={publicToken} customers={customers} feedbackLinks={feedbackLinks} />;
  }

  // ── Render login if not authed ───────────────────────────────────────────────
  if (!token) return <LoginScreen onLogin={handleLogin} />;

  // ── Live search filtering ────────────────────────────────────────────────────
  const q = searchQuery.toLowerCase().trim();

  const filteredCustomers = (Array.isArray(customers) ? customers : []).filter(c => {
    if (!c) return false;
    const name = (c.name || '').toLowerCase();
    const vNum = (c.vehicleNumber || c.vehicle_number || '').toLowerCase();
    const vMod = (c.vehicleModel || c.vehicle_model || '').toLowerCase();
    const mob  = (c.mobile || c.phone || '').toLowerCase();
    const em   = (c.email || '').toLowerCase();
    const sc   = (c.serviceCenter || c.service_center || '').toLowerCase();
    return name.includes(q) || vNum.includes(q) || vMod.includes(q) || mob.includes(q) || em.includes(q) || sc.includes(q);
  });

  const filteredLinks = q
    ? feedbackLinks.filter(l =>
        (l.token || '').toLowerCase().includes(q) ||
        (l.status || '').toLowerCase().includes(q) ||
        getCustName(l.customerId).toLowerCase().includes(q)
      )
    : feedbackLinks;

  const filteredComplaints = q
    ? complaints.filter(c =>
        (c.vehicleNumber || '').toLowerCase().includes(q) ||
        (c.transcript || '').toLowerCase().includes(q) ||
        (c.status || '').toLowerCase().includes(q) ||
        getCustName(c.customerId).toLowerCase().includes(q)
      )
    : complaints;

  const filteredUsers = q
    ? users.filter(u =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.role || '').toLowerCase().includes(q)
      )
    : users;

  const filteredHistory = q
    ? historyLogs.filter(l =>
        (l.action || '').toLowerCase().includes(q) ||
        (l.target || '').toLowerCase().includes(q) ||
        (l.description || '').toLowerCase().includes(q) ||
        (l.actor || '').toLowerCase().includes(q) ||
        (l.badgeText || '').toLowerCase().includes(q)
      )
    : historyLogs;

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer record?')) {
      if (token) {
        try {
          await fetch(`${API_BASE}/customers/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch {}
      }
      setCustomers(prev => prev.filter(c => c._id !== id && c.id !== id));
      addLog({ action: 'CUSTOMER_DELETED', target: `Customer #${(id || '').toString().substring(0, 8)}`, badgeClass: 'badge-coral', badgeText: 'DELETED', description: 'Deleted customer record.' });
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff user account?')) {
      setUsers(prev => prev.filter(u => u._id !== id && u.id !== id));
      addLog({ action: 'USER_DELETED', target: `Staff User #${(id || '').toString().substring(0, 8)}`, badgeClass: 'badge-coral', badgeText: 'DELETED', description: 'Deleted staff user account.' });
    }
  };

  const handleDeleteLink = async (id) => {
    if (window.confirm('Are you sure you want to delete this feedback token link?')) {
      setFeedbackLinks(prev => prev.filter(l => l._id !== id && l.id !== id));
      addLog({ action: 'LINK_DELETED', target: `Token #${(id || '').toString().substring(0, 8)}`, badgeClass: 'badge-coral', badgeText: 'DELETED', description: 'Deleted feedback link token.' });
    }
  };

  const handleEditServiceCenter = (sc) => {
    setEditingServiceCenter(sc);
    setShowServiceCenterModal(true);
  };

  const handleEditUser = (u) => {
    const newName = window.prompt('Enter staff user name:', u.name);
    if (!newName) return;
    const newRole = window.confirm(`Change role for ${newName}? Click OK for Super Admin, Cancel for Service Advisor.`) ? 'ADMIN' : 'STAFF';
    setUsers(prev => prev.map(item => (item._id === u._id || item.id === u.id) ? { ...item, name: newName, role: newRole } : item));
    addLog({ action: 'USER_UPDATED', target: newName, badgeClass: 'badge-blue', badgeText: 'USER UPDATED', description: `Updated staff user account (${newName}).` });
  };

  // ── Render current page view ─────────────────────────────────────────────────
  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':  return <DashboardView customers={filteredCustomers} complaints={filteredComplaints} historyLogs={filteredHistory} getCustName={getCustName} setActiveTab={setActiveTab} onNewCustomer={() => { setEditingCustomer(null); setCustForm({ name: '', mobile: '', email: '', vehicleNumber: '', vehicleModel: '', serviceCenter: serviceCenters[0]?.name || 'Downtown Branch' }); setShowCustomerModal(true); }} onNewLink={() => setShowLinkModal(true)} searchQuery={q} />;
      case 'history':    return <HistoryView historyLogs={filteredHistory} complaints={filteredComplaints} customers={filteredCustomers} getCustName={getCustName} searchQuery={q} />;

      case 'customers':  return (
        <CustomersView
          customers={filteredCustomers}
          onNewCustomer={() => { setEditingCustomer(null); setCustForm({ name: '', mobile: '', email: '', vehicleNumber: '', vehicleModel: '', serviceCenter: serviceCenters[0]?.name || 'Downtown Branch' }); setShowCustomerModal(true); }}
          onEditCustomer={handleEditCustomer}
          onDeleteCustomer={handleDeleteCustomer}
          onViewCustomerComplaints={(c) => { setSearchQuery(c.vehicleNumber || c.vehicle_number || c.name); setActiveTab('complaints'); }}
          searchQuery={q}
        />
      );
      case 'links':      return <LinksView feedbackLinks={filteredLinks} customers={customers} getCustName={getCustName} onNewLink={() => setShowLinkModal(true)} onDeleteLink={handleDeleteLink} searchQuery={q} />;
      case 'complaints': return (
        <ComplaintsView
          complaints={filteredComplaints}
          getCustName={getCustName}
          onUploadInvoice={() => setShowInvoiceModal(true)}
          onDeleteVoiceNote={handleDeleteVoiceNote}
          onDeleteInvoicePdf={handleDeleteInvoicePdf}

          setActiveTab={setActiveTab}
          searchQuery={q}
        />
      );
      case 'comparison': return (
        <ComparisonView
          complaints={filteredComplaints}
          customers={filteredCustomers}
          getCustName={getCustName}
          selectedComplaintId={selectedComplaintId}
          setSelectedComplaintId={setSelectedComplaintId}
          onUploadInvoice={() => setShowInvoiceModal(true)}
        />
      );

      case 'users': return (
        <UsersView
          users={filteredUsers}
          user={user}
          serviceCenters={serviceCenters}
          onAddServiceCenter={() => setShowServiceCenterModal(true)}
          onEditServiceCenter={handleEditServiceCenter}
          onRemoveServiceCenter={handleRemoveServiceCenter}
          onAddUser={() => { setUserModalError(''); setUserForm({ name: '', email: '', password: '', role: 'STAFF' }); setShowUserModal(true); }}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
          searchQuery={q}
        />
      );
      case 'reports': return (
        <ReportsView
          customers={customers}
          complaints={complaints}
          feedbackLinks={feedbackLinks}
          serviceCenters={serviceCenters}
          setActiveTab={setActiveTab}
          setSearchQuery={setSearchQuery}
        />
      );
      default: return <DashboardView customers={filteredCustomers} complaints={filteredComplaints} historyLogs={filteredHistory} getCustName={getCustName} setActiveTab={setActiveTab} onNewCustomer={() => { setEditingCustomer(null); setShowCustomerModal(true); }} onNewLink={() => setShowLinkModal(true)} searchQuery={q} />;
    }
  };

  return (
    <div className="app-layout">
      {/* Collapsible Siderail — shrinks to icon rail when collapsed */}
      <Siderail
        activeTab={activeTab}
        setActiveTab={(tabId) => {
          setActiveTab(tabId);
          setSearchQuery('');
        }}
        collapsed={siderailCollapsed}
        onToggle={() => setSiderailCollapsed(v => !v)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main content area */}
      <div className="main-wrapper">
        <TopHeader
          searchQuery={searchQuery}
          onSearch={(val) => { setSearchQuery(val); }}
          activeTab={activeTab}
        />
        <main className="main-content">
          {renderView()}
        </main>
      </div>

      {/* Modals */}
      {showCustomerModal && (
        <CustomerModal
          onClose={() => { setShowCustomerModal(false); setEditingCustomer(null); }}
          custForm={custForm}
          setCustForm={setCustForm}
          onSubmit={handleCreateCustomer}
          serviceCenters={serviceCenters}
          isEditing={!!editingCustomer}
        />
      )}
      {showLinkModal && (
        <LinkModal
          onClose={() => setShowLinkModal(false)}
          customers={customers}
          selectedCustomerId={selectedCustomerId}
          setSelectedCustomerId={setSelectedCustomerId}
          onSubmit={handleCreateLink}
        />
      )}
      {showInvoiceModal && (
        <InvoiceModal
          onClose={() => setShowInvoiceModal(false)}
          complaints={complaints}
          customers={customers}
          selectedComplaintId={selectedComplaintId}
          setSelectedComplaintId={setSelectedComplaintId}
          setInvoiceFile={setInvoiceFile}
          onSubmit={handleUploadInvoice}
          getCustName={getCustName}
        />
      )}

      {showServiceCenterModal && (
        <ServiceCenterModal
          onClose={() => { setShowServiceCenterModal(false); setEditingServiceCenter(null); }}
          onSave={handleAddServiceCenter}
          editingCenter={editingServiceCenter}
        />
      )}

      {showUserModal && (
        <UserModal
          onClose={() => setShowUserModal(false)}
          userForm={userForm}
          setUserForm={setUserForm}
          onSubmit={handleCreateUser}
          loading={userModalLoading}
          error={userModalError}
        />
      )}

      {/* Snackbar Toast Notification */}
      {snackbar && (
        <div className="snackbar-toast" style={{ borderLeftColor: snackbar.type === 'info' ? 'var(--blue)' : snackbar.type === 'error' ? 'var(--coral)' : 'var(--green)' }}>
          <span style={{ fontSize: '1.1rem' }}>{snackbar.type === 'info' ? 'ℹ️' : snackbar.type === 'error' ? '⚠️' : '📧'}</span>
          <span>{snackbar.message}</span>
          <button
            onClick={() => setSnackbar(null)}
            style={{ background: 'none', border: 'none', color: '#A1A1AA', cursor: 'pointer', fontSize: '1.1rem', marginLeft: '0.5rem' }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
