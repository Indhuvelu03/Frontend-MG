import React, { useState, useEffect } from 'react';
import './index.css';

// Layout Components
import Siderail from './components/Siderail';
import TopHeader from './components/TopHeader';
import { CustomerModal, LinkModal, InvoiceModal, ServiceCenterModal, UserModal, ConfirmModal, EditUserModal } from './components/Modals';


// Page View Components
import DashboardView  from './views/DashboardView';
import HistoryView    from './views/HistoryView';
import CustomersView  from './views/CustomersView';
import LinksView      from './views/LinksView';
import ComplaintsView from './views/ComplaintsView';
import ComparisonView from './views/ComparisonView';
import UsersView      from './views/UsersView';
import ReportsView    from './views/ReportsView';
import EmailActivityView from './views/EmailActivityView';
import ManagerReviewView from './views/ManagerReviewView';
import PublicFeedbackView from './views/PublicFeedbackView';
import PublicTrackingView from './views/PublicTrackingView';

// Icons
import { ZapIcon, ShieldIcon, UserIcon, MailIcon, InfoIcon, AlertTriangleIcon, EyeIcon, EyeOffIcon } from './components/Icons';

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
  const [showPassword, setShowPassword] = useState(false);
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
            <div className="password-input-wrap">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
            <button type="button" className="password-toggle" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
            </button>
            </div>
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
  const [confirmation, setConfirmation] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  // Forms
  const [custForm, setCustForm] = useState({ name: '', mobile: '', email: '', vehicleNumber: '', vehicleModel: '', serviceCenter: 'Downtown Branch' });
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'STAFF' });
  const [userModalLoading, setUserModalLoading] = useState(false);
  const [userModalError, setUserModalError]     = useState('');
  const [customerModalLoading, setCustomerModalLoading] = useState(false);
  const [emailActivities, setEmailActivities] = useState([]);
  const [managerCases, setManagerCases] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedComplaintId, setSelectedComplaintId] = useState('');
  const [invoiceFile, setInvoiceFile] = useState(null);

  useEffect(() => { if (token) fetchBackendData(); }, [token]);
  useEffect(() => { if (token && activeTab === 'email-activity') fetchBackendData(); }, [activeTab, token]);

  // A browser select can display its first option while its controlled state is
  // still empty. Always initialise it with a real complaint ID for invoice upload.
  useEffect(() => {
    if (!selectedComplaintId && complaints.length) {
      setSelectedComplaintId(complaints[0]._id);
    }
  }, [complaints, selectedComplaintId]);

  // Customer feedback is submitted from a separate public browser page. Keep the
  // admin view in sync when the user returns to it, and while it remains open.
  useEffect(() => {
    if (!token) return undefined;
    const refreshOnFocus = () => fetchBackendData();
    const refreshTimer = window.setInterval(refreshOnFocus, 15000);
    window.addEventListener('focus', refreshOnFocus);
    return () => {
      window.clearInterval(refreshTimer);
      window.removeEventListener('focus', refreshOnFocus);
    };
  }, [token]);

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
      const [cRes, lRes, cmpRes, uRes, emailRes, scRes, managerRes, reportRes] = await Promise.all([
        fetch(`${API_BASE}/customers`, { headers }).catch(() => null),
        fetch(`${API_BASE}/feedback-links`, { headers }).catch(() => null),
        fetch(`${API_BASE}/complaints`, { headers }).catch(() => null),
        fetch(`${API_BASE}/auth/users`, { headers }).catch(() => null),
        fetch(`${API_BASE}/email-activity?limit=100`, { headers }).catch(() => null),
        fetch(`${API_BASE}/service-centers`, { headers }).catch(() => null),
        fetch(`${API_BASE}/manager/cases`, { headers }).catch(() => null),
        fetch(`${API_BASE}/reports/dashboard`, { headers }).catch(() => null),
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
      if (emailRes?.ok) {
        const d = await emailRes.json();
        setEmailActivities(d.data || []);
      }
      if (scRes?.ok) {
        const d = await scRes.json();
        setServiceCenters(d.data || []);
      }
      if (managerRes?.ok) {
        const d = await managerRes.json();
        setManagerCases(d.data || []);
      }
      if (reportRes?.ok) {
        const d = await reportRes.json();
        setAnalytics(d.data || null);
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
      return 'Unable to sign in right now. Please check your connection and try again.';
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
    setCustomerModalLoading(true);
    try {
    if (editingCustomer) {
      const cId = editingCustomer._id || editingCustomer.id;
      try {
        const res = await fetch(`${API_BASE}/customers/${cId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(custForm)
        });
        const data = await res.json();
        if (!data.success || !data.data) throw new Error(data.message || 'Customer update failed');
        setCustomers(prev => prev.map(c => (c._id === cId || c.id === cId) ? data.data : c));
      } catch (error) {
        showSnackbar(`Unable to save customer changes: ${error.message}`, 'error');
        return;
      }
      addLog({ action: 'CUSTOMER_UPDATED', target: `${custForm.name} (${custForm.vehicleNumber})`, badgeClass: 'badge-blue', badgeText: 'UPDATED', description: `Updated customer record for ${custForm.name}.` });
      const emailChanged = custForm.email.trim().toLowerCase() !== (editingCustomer.email || '').toLowerCase();
      const vehicleChanged = custForm.vehicleNumber.trim().toUpperCase() !== (editingCustomer.vehicleNumber || editingCustomer.vehicle_number || '').toUpperCase();
      showSnackbar(emailChanged || vehicleChanged ? `Customer updated. A new feedback invite is being sent to ${custEmail}.` : `Customer record for ${custName} updated successfully.`, 'info');
      setEditingCustomer(null);
    } else {
      try {
        const res  = await fetch(`${API_BASE}/customers`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...custForm, serviceDate: new Date().toISOString() }) });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Customer registration failed');
        setCustomers([data.data, ...customers]);
      } catch (error) {
        showSnackbar(`Unable to register customer: ${error.message}`, 'error');
        return;
      }
      addLog({ action: 'CUSTOMER_CREATED', target: `${custForm.name} (${custForm.vehicleNumber})`, badgeClass: 'badge-green', badgeText: 'CREATED', description: `Registered new customer at ${custForm.serviceCenter}.` });
      showSnackbar(`📧 Customer ${custName} registered! Feedback link auto-generated & invite email dispatched to ${custEmail}.`, 'success');
    }
    setShowCustomerModal(false);
    setCustForm({ name: '', mobile: '', email: '', vehicleNumber: '', vehicleModel: '', serviceCenter: serviceCenters[0]?.name || 'Downtown Branch' });
    setTimeout(fetchBackendData, 1200);
    } finally {
      setCustomerModalLoading(false);
    }
  };

  const openInvoiceUpload = () => {
    // Fetch first so a voice/text complaint submitted from the public link is
    // immediately available in the invoice selector.
    if (complaints.length) setSelectedComplaintId(complaints[0]._id);
    setInvoiceFile(null);
    fetchBackendData();
    setShowInvoiceModal(true);
  };

  const requestConfirmation = (title, message, confirmLabel, onConfirm) => {
    setConfirmation({ title, message, confirmLabel, onConfirm });
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
      if (!data.success || !data.data) throw new Error(data.message || 'Unable to create feedback link');
      setFeedbackLinks([data.data, ...feedbackLinks]);
    } catch (error) {
      showSnackbar(`Unable to create feedback link: ${error.message}`, 'error');
      return;
    }
    addLog({ action: 'FEEDBACK_LINK_CREATED', target: 'New Feedback Token', badgeClass: 'badge-amber', badgeText: 'TOKEN ISSUED', description: 'Generated secure public feedback link valid for 7 days.' });
    setShowLinkModal(false);
  };

  const handleUploadInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceFile) {
      showSnackbar('Please select an invoice PDF before uploading.', 'error');
      return;
    }
    const targetRecord = complaints.find(c => c._id === selectedComplaintId);
    if (!targetRecord) {
      showSnackbar('Select a submitted customer feedback record before uploading an invoice.', 'error');
      return;
    }
    const vNum = targetRecord.vehicleNumber;

    const formData = new FormData();
    formData.append('complaintId', selectedComplaintId);
    formData.append('file', invoiceFile);
    try {
      const res = await fetch(`${API_BASE}/invoices/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || `Upload failed (HTTP ${res.status})`);
    } catch (error) {
      showSnackbar(`Invoice upload failed: ${error.message || 'Please try again.'}`, 'error');
      return;
    }
    addLog({ action: 'INVOICE_UPLOADED', target: invoiceFile.name, badgeClass: 'badge-amber', badgeText: 'PDF UPLOADED', description: `Uploaded invoice PDF (${invoiceFile.name}) and completed AI semantic audit for vehicle ${vNum}.` });
    setShowInvoiceModal(false);
    setActiveTab('comparison');
    showSnackbar('Invoice uploaded. Text extraction and AI audit have started.', 'success');
    setTimeout(fetchBackendData, 1000);
  };

  // Delete Voice Note (so customer can re-record latest audio)
  const handleDeleteVoiceNote = (complaintId) => {
    requestConfirmation('Delete voice recording', 'Delete this voice recording and its related audit files? The customer can submit a new response using a new feedback link.', 'Delete recording', async () => {
      const res = await fetch(`${API_BASE}/complaints/${complaintId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok || !data.success) { showSnackbar(data.message || 'Unable to delete voice recording.', 'error'); return; }
      setComplaints(prev => prev.filter(c => c._id !== complaintId));
      addLog({ action: 'VOICE_NOTE_DELETED', target: `Complaint #${complaintId.substring(0, 8)}`, badgeClass: 'badge-coral', badgeText: 'VOICE DELETED', description: 'Deleted incorrect voice recording so customer can submit latest audio response.' });
      showSnackbar('Voice recording deleted.', 'info');
    });
  };

  const handleResendLink = async (feedbackLinkId) => {
    try {
      const res = await fetch(`${API_BASE}/feedback-links/send`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ feedbackLinkId }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Unable to queue invite');
      showSnackbar('Feedback invitation queued for resend.', 'success');
      setTimeout(fetchBackendData, 1000);
    } catch (error) { showSnackbar(error.message, 'error'); }
  };

  const handleManagerReview = async (complaintId, reviewStatus, reviewNotes) => {
    try {
      const res = await fetch(`${API_BASE}/manager/cases/${complaintId}/review`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ reviewStatus, reviewNotes }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Unable to save manager decision');
      showSnackbar('Manager decision saved.', 'success');
      fetchBackendData();
    } catch (error) { showSnackbar(error.message, 'error'); }
  };

  // Delete Wrong Invoice PDF
  const handleDeleteInvoicePdf = (complaintId) => {
    requestConfirmation('Delete invoice PDF', 'Delete the uploaded invoice PDF while retaining the customer feedback record?', 'Delete invoice', async () => {
      const res = await fetch(`${API_BASE}/invoices/complaint/${complaintId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok || !data.success) { showSnackbar(data.message || 'Unable to delete invoice.', 'error'); return; }
      addLog({ action: 'INVOICE_PDF_DELETED', target: `Complaint #${complaintId.substring(0, 8)}`, badgeClass: 'badge-coral', badgeText: 'PDF DELETED', description: 'Deleted wrongly uploaded repair invoice PDF.' });
      showSnackbar('Invoice PDF deleted.', 'info');
    });
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

  const handleAddServiceCenter = async (name, location, managerEmail, existingId) => {
    try {
      const res = await fetch(`${API_BASE}/service-centers${existingId ? `/${existingId}` : ''}`, { method: existingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name, location: location || 'Main', managerEmail }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Unable to save service center');
      if (existingId) {
      setServiceCenters(prev => prev.map(s => s.id === existingId ? data.data : s));
      addLog({ action: 'SERVICE_CENTER_UPDATED', target: name, badgeClass: 'badge-blue', badgeText: 'BRANCH UPDATED', description: `Updated service center branch (${name}) — Manager: ${emailVal}.` });
      showSnackbar(`Branch ${name} updated. Escalations will go to ${managerEmail}`, 'info');
    } else {
      setServiceCenters(prev => [...prev, data.data]);
      addLog({ action: 'SERVICE_CENTER_ADDED', target: name, badgeClass: 'badge-purple', badgeText: 'BRANCH ADDED', description: `Added new service center branch (${name}) — Manager: ${managerEmail}.` });
      showSnackbar(`New branch ${name} registered.`, 'success');
    }
    } catch (error) { showSnackbar(error.message, 'error'); return; }
    setEditingServiceCenter(null);
  };

  const handleRemoveServiceCenter = async (id) => {
    const center = serviceCenters.find(s => s.id === id);
    const res = await fetch(`${API_BASE}/service-centers/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) { showSnackbar('Unable to delete service center.', 'error'); return; }
    setServiceCenters(prev => prev.filter(s => s.id !== id));
    addLog({ action: 'SERVICE_CENTER_REMOVED', target: center?.name || 'Branch', badgeClass: 'badge-coral', badgeText: 'BRANCH DELETED', description: `Removed service center branch (${center?.name}).` });
  };

  // ── Public Customer Feedback Route ───────────────────────────────────────────
  const path = window.location.pathname;
  if (path.includes('/tracking/')) {
    const publicToken = path.split('/').filter(Boolean).pop();
    return <PublicTrackingView token={publicToken} />;
  }
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
    requestConfirmation('Delete customer record', 'Delete this customer and vehicle record? This cannot be undone.', 'Delete customer', async () => {
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
      showSnackbar('Customer record deleted.', 'info');
    });
  };

  const handleDeleteUser = async (id) => {
    requestConfirmation('Delete staff account', 'Delete this staff account from the dashboard?', 'Delete account', () => {
      fetch(`${API_BASE}/auth/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json().then(data => ({ res, data })))
        .then(({ res, data }) => {
          if (!res.ok || !data.success) throw new Error(data.message || 'Unable to delete staff account');
          setUsers(prev => prev.filter(u => u._id !== id && u.id !== id));
          addLog({ action: 'USER_DELETED', target: `Staff User #${(id || '').toString().substring(0, 8)}`, badgeClass: 'badge-coral', badgeText: 'DELETED', description: 'Deleted staff user account.' });
          showSnackbar('Staff account deleted.', 'info');
        }).catch(error => showSnackbar(error.message, 'error'));
    });
  };

  const handleDeleteLink = async (id) => {
    requestConfirmation('Delete feedback link', 'Delete this secure feedback link? The customer will no longer be able to use it.', 'Delete link', () => {
      fetch(`${API_BASE}/feedback-links/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json().then(data => ({ res, data })))
        .then(({ res, data }) => {
          if (!res.ok || !data.success) throw new Error(data.message || 'Unable to delete feedback link');
          setFeedbackLinks(prev => prev.filter(l => l._id !== id && l.id !== id));
          addLog({ action: 'LINK_DELETED', target: `Token #${(id || '').toString().substring(0, 8)}`, badgeClass: 'badge-coral', badgeText: 'DELETED', description: 'Deleted feedback link token.' });
          showSnackbar('Feedback link deleted.', 'info');
        }).catch(error => showSnackbar(error.message, 'error'));
    });
  };

  const handleEditServiceCenter = (sc) => {
    setEditingServiceCenter(sc);
    setShowServiceCenterModal(true);
  };

  const handleEditUser = (u) => {
    setEditingUser(u);
  };

  const saveEditedUser = async (updatedUser) => {
    try {
      const id = updatedUser._id || updatedUser.id;
      const res = await fetch(`${API_BASE}/auth/users/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: updatedUser.name, role: updatedUser.role }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Unable to update staff account');
      setUsers(prev => prev.map(item => (item._id === id || item.id === id) ? data.data : item));
      addLog({ action: 'USER_UPDATED', target: data.data.name, badgeClass: 'badge-blue', badgeText: 'USER UPDATED', description: `Updated staff user account (${data.data.name}).` });
      showSnackbar('Staff account updated.', 'success');
      setEditingUser(null);
    } catch (error) { showSnackbar(error.message, 'error'); }
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
      case 'links':      return <LinksView feedbackLinks={filteredLinks} customers={customers} getCustName={getCustName} onNewLink={() => setShowLinkModal(true)} onDeleteLink={handleDeleteLink} onResendLink={handleResendLink} searchQuery={q} />;
      case 'complaints': return (
        <ComplaintsView
          complaints={filteredComplaints}
          getCustName={getCustName}
          onUploadInvoice={openInvoiceUpload}
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
          onUploadInvoice={openInvoiceUpload}
        />
      );
      case 'email-activity': return <EmailActivityView activities={emailActivities} searchQuery={q} />;
      case 'manager-review': return <ManagerReviewView cases={managerCases} onReview={handleManagerReview} />;

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
          analytics={analytics}
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
          loading={customerModalLoading}
        />
      )}
      {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={saveEditedUser} />}
      {confirmation && <ConfirmModal {...confirmation} onClose={() => setConfirmation(null)} />}
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
