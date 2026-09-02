import React, { useState, useEffect, useRef } from 'react';
import './index.css';

// Layout Components
import Siderail from './components/Siderail';
import TopHeader from './components/TopHeader';
import { CustomerModal, LinkModal, InvoiceModal, ServiceCenterModal, UserModal, ConfirmModal, EditUserModal, DealershipModal, DealerModal, Modal } from './components/Modals';


// Page View Components
import DashboardView       from './views/DashboardView';
import AdminDashboardView  from './views/AdminDashboardView';
import HistoryView         from './views/HistoryView';
import CustomersView       from './views/CustomersView';
import LinksView           from './views/LinksView';
import ComplaintsView      from './views/ComplaintsView';
import ComparisonView      from './views/ComparisonView';
import UsersView           from './views/UsersView';
import ReportsView         from './views/ReportsView';
import EmailActivityView   from './views/EmailActivityView';
import ManagerReviewView   from './views/ManagerReviewView';
import PublicFeedbackView  from './views/PublicFeedbackView';
import PublicTrackingView  from './views/PublicTrackingView';
import DealershipsView     from './views/DealershipsView';
import DealersView         from './views/DealersView';
import DealerPerformanceView from './views/DealerPerformanceView';
import ServiceCentersView   from './views/ServiceCentersView';

// Icons
import { ZapIcon, ShieldIcon, UserIcon, MailIcon, InfoIcon, AlertTriangleIcon, EyeIcon, EyeOffIcon } from './components/Icons';
const rawApiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';
const API_BASE = rawApiBase.endsWith('/api') ? rawApiBase : `${rawApiBase.replace(/\/$/, '')}/api`;

function LoginScreen({ onLogin, onVerifyMfa, onRequestReset }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [mfaCode, setMfaCode]   = useState('');
  const [forgotMode, setForgotMode] = useState(false);
  const [notice, setNotice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = forgotMode ? await onRequestReset(email) : mfaToken ? await onVerifyMfa(mfaToken, mfaCode) : await onLogin(email, password);
    if (typeof result === 'string') setError(result);
    else if (result?.mfaRequired) setMfaToken(result.mfaToken);
    else if (forgotMode && result?.message) setNotice(result.message);
    setLoading(false);
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo"><ZapIcon size={20} /></div>
          <h1 className="login-title">AutoAudit AI</h1>
          <p className="login-subtitle">{forgotMode ? 'Request a secure password reset' : mfaToken ? 'Enter your authenticator code' : 'Sign in to your account'}</p>
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
        {notice && <div style={{ padding: '.75rem 1rem', marginBottom: '1rem', background: 'var(--green-bg)', border: '1px solid var(--green-border)', color: 'var(--green)', fontSize: '.82rem', fontWeight: 600 }}>{notice}</div>}

        <form onSubmit={handleSubmit}>
          {mfaToken ? <div className="form-group">
            <label className="form-label" htmlFor="mfa-code">6-digit authentication code</label>
            <input id="mfa-code" className="form-input" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={mfaCode} onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))} autoComplete="one-time-code" required autoFocus />
          </div> : <><div className="form-group">
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
          {!forgotMode && <div className="form-group">
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
          </div>}
          </>}
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Please wait…' : forgotMode ? 'Send Reset Link' : mfaToken ? 'Verify & Sign In' : 'Sign In'}
          </button>
          {!mfaToken && <button type="button" className="btn btn-secondary btn-full" style={{ marginTop: '.6rem' }} onClick={() => { setForgotMode(value => !value); setError(''); setNotice(''); }}>{forgotMode ? 'Back to Sign In' : 'Forgot password?'}</button>}
        </form>
      </div>
    </div>
  );
}

function ResetPasswordScreen({ resetToken }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async event => {
    event.preventDefault(); setError('');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: resetToken, password }) });
      const data = await response.json();
      data.success ? setMessage(data.message) : setError(data.message || 'Unable to reset password.');
    } catch { setError('Unable to reset password.'); }
    setLoading(false);
  };

  return <div className="login-screen"><div className="login-card">
    <div className="login-brand"><div className="login-logo"><ShieldIcon size={20} /></div><h1 className="login-title">Create a new password</h1><p className="login-subtitle">This secure link works only once.</p></div>
    {error && <div style={{ padding: '.75rem', marginBottom: '1rem', background: 'var(--coral-bg)', color: 'var(--coral)' }}>{error}</div>}
    {message ? <><div style={{ padding: '.75rem', marginBottom: '1rem', background: 'var(--green-bg)', color: 'var(--green)' }}>{message}</div><a href="/" className="btn btn-primary btn-full">Return to Sign In</a></> : <form onSubmit={submit}>
      <div className="form-group"><label className="form-label">New password</label><input type="password" className="form-input" minLength={10} value={password} onChange={event => setPassword(event.target.value)} required /></div>
      <div className="form-group"><label className="form-label">Confirm password</label><input type="password" className="form-input" minLength={10} value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} required /></div>
      <p className="table-muted">At least 10 characters with uppercase, lowercase and a number.</p><button className="btn btn-primary btn-full" disabled={loading}>{loading ? 'Updating…' : 'Update Password'}</button>
    </form>}
  </div></div>;
}

// ─── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [token, setToken]     = useState(sessionStorage.getItem('admin_token') || null);
  const [user, setUser]       = useState(JSON.parse(sessionStorage.getItem('admin_user') || 'null'));
  const [activeTab, setActiveTab]               = useState(() => sessionStorage.getItem('activeTab') || 'dashboard');
  const [siderailCollapsed, setSiderailCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync activeTab to sessionStorage for tab persistence across reloads
  useEffect(() => { sessionStorage.setItem('activeTab', activeTab); }, [activeTab]);
  useEffect(() => {
    ['admin_token','admin_user','admin_customers','admin_links','admin_complaints','admin_users','admin_history','admin_service_centers','admin_dealerships','admin_active_dealership_id'].forEach(key => localStorage.removeItem(key));
  }, []);

  // Sensitive operational data stays in memory and is re-fetched after login.
  const [customers, setCustomers] = useState([]);
  const [feedbackLinks, setFeedbackLinks] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [serviceCenters, setServiceCenters] = useState([]);
  const [users, setUsers] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [dealerships, setDealerships] = useState([]);
  const [activeDealershipId, setActiveDealershipId] = useState(() => {
    try { return new URLSearchParams(window.location.search).get('dealershipId') || ''; }
    catch { return ''; }
  });
  const [viewingDealer, setViewingDealer] = useState(null);
  const backendFetchInFlight = useRef(false);

  const effectiveDealerId = user?.role === 'ADMIN'
    ? (activeDealershipId || null)
    : (user?.dealershipId || user?.dealership_id || null);
  const isAdminDealerContext = user?.role === 'ADMIN' && Boolean(effectiveDealerId);

  // Modals
  const [showCustomerModal, setShowCustomerModal]           = useState(false);
  const [showLinkModal, setShowLinkModal]                   = useState(false);
  const [showInvoiceModal, setShowInvoiceModal]             = useState(false);
  const [showServiceCenterModal, setShowServiceCenterModal] = useState(false);
  const [showUserModal, setShowUserModal]                   = useState(() => sessionStorage.getItem('ui_open_modal') === 'user');
  const [showDealershipModal, setShowDealershipModal]       = useState(false);
  const [showSecurityModal, setShowSecurityModal]           = useState(false);
  const [mfaSetup, setMfaSetup] = useState(null);
  const [mfaSettingsCode, setMfaSettingsCode] = useState('');
  const [editingCustomer, setEditingCustomer]               = useState(null);
  const [editingComplaint, setEditingComplaint]             = useState(null);
  const [editingServiceCenter, setEditingServiceCenter]     = useState(null);
  const [editingDealership, setEditingDealership]           = useState(null);
  const [editingUser, setEditingUser]                       = useState(null);
  const [confirmation, setConfirmation]                     = useState(null);

  const requestConfirmation = (title, message, confirmLabel, onConfirm) => {
    setConfirmation({ title, message, confirmLabel, onConfirm });
  };

  // Forms
  const [custForm, setCustForm] = useState({ name: '', mobile: '+91 ', email: '', vehicleNumber: '', vehicleModel: '', serviceCenter: 'Downtown Branch' });
  const [userForm, setUserForm] = useState(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('ui_user_draft') || 'null');
      return saved ? { ...saved, password: '', phone: saved.phone || '+91 ' } : { name: '', email: '', password: '', phone: '+91 ', role: 'STAFF', dealershipId: '' };
    } catch {
      return { name: '', email: '', password: '', phone: '+91 ', role: 'STAFF', dealershipId: '' };
    }
  });
  const [userModalLoading, setUserModalLoading] = useState(false);
  const [userModalError, setUserModalError]     = useState('');
  const [customerModalLoading, setCustomerModalLoading] = useState(false);
  const [emailActivities, setEmailActivities] = useState([]);
  const [managerCases, setManagerCases] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [reportFilters, setReportFilters] = useState(() => {
    const to = new Date();
    const from = new Date(to.getTime() - 29 * 86400000);
    return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedComplaintId, setSelectedComplaintId] = useState('');
  const [invoiceFile, setInvoiceFile] = useState(null);

  // Keep an unfinished user modal available after a browser refresh. Passwords
  // are deliberately excluded so credentials are never written to web storage.
  useEffect(() => {
    if (!showUserModal) {
      if (sessionStorage.getItem('ui_open_modal') === 'user') sessionStorage.removeItem('ui_open_modal');
      sessionStorage.removeItem('ui_user_draft');
      return;
    }
    const { password: _password, ...safeDraft } = userForm;
    sessionStorage.setItem('ui_open_modal', 'user');
    sessionStorage.setItem('ui_user_draft', JSON.stringify(safeDraft));
  }, [showUserModal, userForm]);

  useEffect(() => { if (token) fetchBackendData(); }, [token, effectiveDealerId, reportFilters.from, reportFilters.to]);
  useEffect(() => { if (token && activeTab === 'email-activity') fetchBackendData(); }, [activeTab, token]);

  useEffect(() => {
    if (user?.role !== 'ADMIN' || !activeDealershipId) {
      setViewingDealer(null);
      return;
    }
    const dealer = dealerships.find(d => (d._id || d.id) === activeDealershipId) || null;
    setViewingDealer(dealer);
  }, [activeDealershipId, dealerships, user?.role]);

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
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') fetchBackendData();
    };
    const refreshTimer = window.setInterval(refreshWhenVisible, 60000);
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.clearInterval(refreshTimer);
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [token, effectiveDealerId, reportFilters.from, reportFilters.to]);

  const getCustName = (id) => {
    if (typeof id === 'object' && id?.name) return id.name;
    return customers.find(c => c._id === id || c.id === id)?.name || 'Customer';
  };

  const addLog = (entry) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setHistoryLogs(prev => [{ id: 'log-' + Date.now(), timestamp: now, actor: `${user?.name || 'System Admin'} (${user?.role || 'ADMIN'})`, badgeClass: 'badge-green', badgeText: 'COMPLETED', ...entry }, ...prev]);
  };

  const fetchBackendData = async () => {
    if (!token || backendFetchInFlight.current) return;
    backendFetchInFlight.current = true;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const safeJson = async (res) => {
        if (!res || !res.ok) return null;
        const ct = res.headers?.get('content-type') || '';
        if (!ct.includes('application/json')) return null;
        try { return await res.json(); } catch { return null; }
      };

      const dParam = effectiveDealerId ? `?dealershipId=${encodeURIComponent(effectiveDealerId)}` : '';
      const appendDealer = (path, hasQuery = false) => `${path}${dParam ? `${hasQuery ? '&' : '?'}${dParam.slice(1)}` : ''}`;
      const reportParams = new URLSearchParams();
      if (reportFilters.from) reportParams.set('from', reportFilters.from);
      if (reportFilters.to) reportParams.set('to', reportFilters.to);
      if (effectiveDealerId) reportParams.set('dealershipId', effectiveDealerId);
      const [cRes, lRes, cmpRes, uRes, emailRes, scRes, managerRes, reportRes, dRes] = await Promise.all([
        fetch(`${API_BASE}/customers${dParam}`, { headers }).catch(() => null),
        fetch(appendDealer(`${API_BASE}/feedback-links`), { headers }).catch(() => null),
        fetch(`${API_BASE}/complaints${dParam}`, { headers }).catch(() => null),
        fetch(appendDealer(`${API_BASE}/auth/users`), { headers }).catch(() => null),
        fetch(appendDealer(`${API_BASE}/email-activity?limit=100`, true), { headers }).catch(() => null),
        fetch(appendDealer(`${API_BASE}/service-centers`), { headers }).catch(() => null),
        fetch(appendDealer(`${API_BASE}/manager/cases`), { headers }).catch(() => null),
        fetch(`${API_BASE}/reports/dashboard?${reportParams.toString()}`, { headers }).catch(() => null),
        fetch(`${API_BASE}/dealerships`, { headers }).catch(() => null),
      ]);

      if (cRes?.status === 401 || lRes?.status === 401 || cmpRes?.status === 401 || uRes?.status === 401) {
        sessionStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_user');
        setToken(null);
        setUser(null);
        showSnackbar('⚠️ Session expired. Please sign in again.', 'error');
        return;
      }

      const cData = await safeJson(cRes);
      if (cData) setCustomers(cData.data?.customers || cData.data || []);

      const lData = await safeJson(lRes);
      if (lData) setFeedbackLinks(lData.data || []);

      const cmpData = await safeJson(cmpRes);
      if (cmpData) {
        const complaintList = cmpData.data || [];
        // A complaint record does not contain the AI result itself. Load its
        // persisted comparison instead of rendering placeholder repair items.
        const complaintsWithAudits = await Promise.all(complaintList.map(async (complaint) => {
          try {
            const response = await fetch(`${API_BASE}/comparison/${complaint._id}`, { headers });
            const result = await safeJson(response);
            const audit = result?.data;
            if (!audit) return complaint;
            return {
              ...complaint,
              aiComparison: {
                matchPercentage: Math.round(Number(audit.score) || 0),
                conclusion: audit.status,
                matchedItems: audit.matchedIssues || [],
                missingIssues: audit.missingIssues || [],
                extraInvoiceItems: audit.extraInvoiceItems || [],
                analysis: audit.summary || '',
                reportUrl: audit.reportUrl || null,
              },
            };
          } catch {
            return complaint;
          }
        }));
        setComplaints(complaintsWithAudits);
      }

      const uData = await safeJson(uRes);
      if (uData) setUsers(uData.data || []);

      const emailData = await safeJson(emailRes);
      if (emailData) setEmailActivities(emailData.data || []);

      const scData = await safeJson(scRes);
      if (scData) setServiceCenters(scData.data || []);

      const managerData = await safeJson(managerRes);
      if (managerData) setManagerCases(managerData.data || []);

      const reportData = await safeJson(reportRes);
      if (reportData) setAnalytics(reportData.data || null);

      const dData = await safeJson(dRes);
      if (dData) setDealerships(dData.data || []);
    } catch {
      // Individual request failures are handled without replacing valid screen data.
    } finally {
      backendFetchInFlight.current = false;
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success && data.data?.mfaRequired) return data.data;
      if (data.success && data.data?.token) {
        setToken(data.data.token);
        setUser(data.data.user);
        sessionStorage.setItem('admin_token', data.data.token);
        sessionStorage.setItem('admin_user', JSON.stringify(data.data.user));
        // Admin goes to Network Overview; Dealer/Staff go to operational dashboard
        const defaultTab = data.data.user.role === 'ADMIN' && !activeDealershipId ? 'network-dashboard' : 'dashboard';
        setActiveTab(defaultTab);
        sessionStorage.setItem('activeTab', defaultTab);
        const roleLabel = data.data.user.role === 'ADMIN' ? 'Super Admin' : data.data.user.role === 'DEALER' ? 'Dealer Manager' : 'Service Advisor';
        showSnackbar(`Welcome back, ${data.data.user.name}! Signed in as ${roleLabel}.`, 'success');
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
    if (token) fetch(`${API_BASE}/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_user');
    sessionStorage.removeItem('ui_open_modal');
    sessionStorage.removeItem('ui_user_draft');
    setCustomers([]); setFeedbackLinks([]); setComplaints([]); setUsers([]); setHistoryLogs([]); setServiceCenters([]); setDealerships([]);
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
    if (!editingCustomer && user?.role === 'ADMIN' && !effectiveDealerId) {
      showSnackbar('Select a dealer from Scope or open a dealer workspace before registering a customer.', 'error');
      return;
    }
    const custName = custForm.name;
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
      const mobileChanged = custForm.mobile.replace(/\D/g, '') !== (editingCustomer.mobile || '').replace(/\D/g, '');
      showSnackbar(emailChanged || vehicleChanged || mobileChanged ? 'Customer updated. A new feedback invite was queued through the configured communication channels.' : `Customer record for ${custName} updated successfully.`, 'info');
      setEditingCustomer(null);
    } else {
      try {
        const res  = await fetch(`${API_BASE}/customers`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...custForm, dealershipId: effectiveDealerId || undefined, serviceDate: new Date().toISOString() }) });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Customer registration failed');
        setCustomers([data.data, ...customers]);
      } catch (error) {
        showSnackbar(`Unable to register customer: ${error.message}`, 'error');
        return;
      }
      addLog({ action: 'CUSTOMER_CREATED', target: `${custForm.name} (${custForm.vehicleNumber})`, badgeClass: 'badge-green', badgeText: 'CREATED', description: `Registered new customer at ${custForm.serviceCenter}.` });
      showSnackbar(`Customer ${custName} registered. The secure feedback invite was queued across WhatsApp, SMS and email.`, 'success');
    }
    setShowCustomerModal(false);
    setCustForm({ name: '', mobile: '+91 ', email: '', vehicleNumber: '', vehicleModel: '', serviceCenter: serviceCenters[0]?.name || 'Downtown Branch' });
    setTimeout(fetchBackendData, 1200);
    } finally {
      setCustomerModalLoading(false);
    }
  };

  const handleVerifyMfa = async (mfaToken, code) => {
    try {
      const res = await fetch(`${API_BASE}/auth/mfa/verify-login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mfaToken, code })
      });
      const data = await res.json();
      if (!data.success || !data.data?.token) return data.message || 'Invalid authentication code.';
      setToken(data.data.token); setUser(data.data.user);
      sessionStorage.setItem('admin_token', data.data.token);
      sessionStorage.setItem('admin_user', JSON.stringify(data.data.user));
      const defaultTab = data.data.user.role === 'ADMIN' && !activeDealershipId ? 'network-dashboard' : 'dashboard';
      setActiveTab(defaultTab); sessionStorage.setItem('activeTab', defaultTab);
      return null;
    } catch { return 'Unable to verify the authentication code.'; }
  };

  const handleRequestPasswordReset = async email => {
    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await response.json();
      return data.success ? { message: data.message } : (data.message || 'Unable to request password reset.');
    } catch { return 'Unable to request password reset.'; }
  };

  const openInvoiceUpload = () => {
    // Fetch first so a voice/text complaint submitted from the public link is
    // immediately available in the invoice selector.
    if (complaints.length) setSelectedComplaintId(complaints[0]._id);
    setInvoiceFile(null);
    fetchBackendData();
    setShowInvoiceModal(true);
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

  const handleServiceStatusChange = async (complaintId, serviceStatus) => {
    try {
      const response = await fetch(`${API_BASE}/complaints/${complaintId}`, { method:'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body:JSON.stringify({ serviceStatus }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Unable to update service stage');
      setComplaints(previous => previous.map(item => (item._id === complaintId || item.id === complaintId) ? { ...item, ...result.data, serviceStatus } : item));
      showSnackbar(`Service stage updated to ${serviceStatus.replaceAll('_',' ').toLowerCase()}. Customer notification queued.`, 'success');
      setTimeout(fetchBackendData, 800);
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

  const handleAddServiceCenter = async (name, location, managerEmail, existingId, phone = '') => {
    try {
      const res = await fetch(`${API_BASE}/service-centers${existingId ? `/${existingId}` : ''}`, { method: existingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name, branch: location || 'Main', location: location || 'Main', phone, managerEmail, dealershipId: effectiveDealerId || undefined }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Unable to save service center');
      if (existingId) {
        setServiceCenters(prev => prev.map(s => s.id === existingId ? data.data : s));
        addLog({ action: 'SERVICE_CENTER_UPDATED', target: name, badgeClass: 'badge-blue', badgeText: 'BRANCH UPDATED', description: `Updated service center branch (${name}) — Manager: ${managerEmail}.` });
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
  if (path.includes('/reset-password/')) {
    return <ResetPasswordScreen resetToken={path.split('/').filter(Boolean).pop()} />;
  }
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
  if (!token) return <LoginScreen onLogin={handleLogin} onVerifyMfa={handleVerifyMfa} onRequestReset={handleRequestPasswordReset} />;

  // ── Live search & dealer scoping ─────────────────────────────────────────────
  const q = searchQuery.toLowerCase().trim();

  const scopedCustomers = effectiveDealerId
    ? (Array.isArray(customers) ? customers : []).filter(c => c && (c.dealershipId === effectiveDealerId || c.dealerId === effectiveDealerId || c.dealership_id === effectiveDealerId))
    : (Array.isArray(customers) ? customers : []);

  const filteredCustomers = scopedCustomers.filter(c => {
    if (!c) return false;
    const name = (c.name || '').toLowerCase();
    const vNum = (c.vehicleNumber || c.vehicle_number || '').toLowerCase();
    const vMod = (c.vehicleModel || c.vehicle_model || '').toLowerCase();
    const mob  = (c.mobile || c.phone || '').toLowerCase();
    const em   = (c.email || '').toLowerCase();
    const sc   = (c.serviceCenter || c.service_center || '').toLowerCase();
    return name.includes(q) || vNum.includes(q) || vMod.includes(q) || mob.includes(q) || em.includes(q) || sc.includes(q);
  });

  const scopedLinks = effectiveDealerId
    ? (Array.isArray(feedbackLinks) ? feedbackLinks : []).filter(l => {
        const linkDealerId = l.dealershipId || l.dealership_id;
        const customerId = l.customerId?._id || l.customerId?.id || l.customerId || l.customer_id;
        return linkDealerId === effectiveDealerId || scopedCustomers.some(c => (c._id || c.id) === customerId);
      })
    : (Array.isArray(feedbackLinks) ? feedbackLinks : []);

  const filteredLinks = q
    ? scopedLinks.filter(l =>
        (l.token || '').toLowerCase().includes(q) ||
        (l.status || '').toLowerCase().includes(q) ||
        getCustName(l.customerId).toLowerCase().includes(q)
      )
    : scopedLinks;

  const scopedComplaints = effectiveDealerId
    ? (Array.isArray(complaints) ? complaints : []).filter(c => c && (c.dealershipId === effectiveDealerId || scopedCustomers.some(cust => (cust._id || cust.id) === (c.customerId || c.customer_id))))
    : (Array.isArray(complaints) ? complaints : []);

  const filteredComplaints = q
    ? scopedComplaints.filter(c =>
        (c.vehicleNumber || '').toLowerCase().includes(q) ||
        (c.transcript || '').toLowerCase().includes(q) ||
        (c.status || '').toLowerCase().includes(q) ||
        getCustName(c.customerId).toLowerCase().includes(q)
      )
    : scopedComplaints;

  const scopedUsers = effectiveDealerId
    ? (Array.isArray(users) ? users : []).filter(u => u && (u.dealershipId === effectiveDealerId || u.dealerId === effectiveDealerId))
    : (Array.isArray(users) ? users : []);

  const filteredUsers = q
    ? scopedUsers.filter(u =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.role || '').toLowerCase().includes(q)
      )
    : scopedUsers;

  const scopedServiceCenters = effectiveDealerId
    ? (Array.isArray(serviceCenters) ? serviceCenters : []).filter(s => s && (s.dealershipId === effectiveDealerId || s.dealership_id === effectiveDealerId))
    : (Array.isArray(serviceCenters) ? serviceCenters : []);

  const filteredServiceCenters = q
    ? scopedServiceCenters.filter(s =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.branch || s.location || '').toLowerCase().includes(q) ||
        (s.phone || '').toLowerCase().includes(q) ||
        (s.managerEmail || s.manager_email || '').toLowerCase().includes(q)
      )
    : scopedServiceCenters;

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

  // ── Dealership Branch Actions (Super Admin Exclusive) ────────────────────────
  const handleCreateDealership = async (formData) => {
    try {
      const existingId = editingDealership?._id || editingDealership?.id;
      const url = existingId
        ? `${API_BASE}/dealerships/${existingId}`
        : `${API_BASE}/dealerships`;
      const res = await fetch(url, {
        method: existingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const ct = res.headers?.get('content-type') || '';
      let data = {};
      if (ct.includes('application/json')) {
        try { data = await res.json(); } catch { data = {}; }
      }
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Server returned ${res.status} error while saving dealership branch`);
      }
      if (existingId) {
        setDealerships(prev => prev.map(d => (d._id === existingId || d.id === existingId) ? data.data : d));
        addLog({ action: 'DEALERSHIP_UPDATED', target: formData.name, badgeClass: 'badge-blue', badgeText: 'BRANCH UPDATED', description: `Updated dealership branch (${formData.name}).` });
        showSnackbar(`Dealership "${formData.name}" updated.`, 'success');
      } else {
        setDealerships(prev => [data.data, ...prev]);
        addLog({ action: 'DEALERSHIP_CREATED', target: formData.name, badgeClass: 'badge-purple', badgeText: 'BRANCH CREATED', description: `Created new dealership branch (${formData.name}).` });
        showSnackbar(`Dealership "${formData.name}" created!`, 'success');
      }
      setShowDealershipModal(false);
      setEditingDealership(null);
    } catch (error) { showSnackbar(error.message, 'error'); }
  };

  const downloadExecutiveReport = async (format) => {
    try {
      const params = new URLSearchParams();
      if (reportFilters.from) params.set('from', reportFilters.from);
      if (reportFilters.to) params.set('to', reportFilters.to);
      if (effectiveDealerId) params.set('dealershipId', effectiveDealerId);
      const response = await fetch(`${API_BASE}/reports/dashboard/export.${format}?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error(`Export failed (HTTP ${response.status})`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `executive-report-${reportFilters.from || 'all'}-${reportFilters.to || 'now'}.${format}`;
      document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
      showSnackbar(`${format.toUpperCase()} executive report downloaded.`, 'success');
    } catch (error) { showSnackbar(error.message || 'Unable to download report.', 'error'); }
  };

  const openDealerWorkspace = (dealer) => {
    const dealershipId = dealer?._id || dealer?.id;
    if (!dealershipId) {
      showSnackbar('Unable to open this dealer because its branch ID is missing.', 'error');
      return;
    }

    const dealerUrl = new URL(window.location.origin);
    dealerUrl.searchParams.set('dealershipId', dealershipId);

    // Open from the click event so browsers allow the tab, then copy only this
    // authenticated session into the same-origin tab. Credentials never enter
    // the URL or persistent localStorage.
    const dealerTab = window.open('', '_blank');
    if (!dealerTab) {
      showSnackbar('The dealer tab was blocked. Allow pop-ups for this site and try again.', 'error');
      return;
    }

    try {
      dealerTab.sessionStorage.setItem('admin_token', token);
      dealerTab.sessionStorage.setItem('admin_user', JSON.stringify(user));
      dealerTab.sessionStorage.setItem('activeTab', 'dashboard');
      dealerTab.opener = null;
      dealerTab.location.replace(dealerUrl.toString());
      showSnackbar(`Opened ${dealer.name || 'dealer'} workspace in a new tab.`, 'info');
    } catch {
      dealerTab.close();
      showSnackbar('Unable to transfer the secure admin session to the dealer tab.', 'error');
    }
  };

  const changeAdminDealership = (dealershipId) => {
    // Clear the old branch immediately; the scoped API refresh repopulates the
    // selected branch. This prevents a brief flash of another dealer's records.
    setCustomers([]);
    setFeedbackLinks([]);
    setComplaints([]);
    setUsers([]);
    setEmailActivities([]);
    setManagerCases([]);
    setServiceCenters([]);
    setAnalytics(null);
    setSelectedCustomerId('');
    setSelectedComplaintId('');
    setActiveDealershipId(dealershipId);
    setSearchQuery('');
    setActiveTab(dealershipId ? 'dashboard' : 'network-dashboard');
    const nextUrl = new URL(window.location.href);
    if (dealershipId) nextUrl.searchParams.set('dealershipId', dealershipId);
    else nextUrl.searchParams.delete('dealershipId');
    window.history.replaceState({}, '', `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
    if (!dealershipId) showSnackbar('Returned to the Super Admin network view.', 'info');
  };

  const handleDeleteDealership = (id) => {
    requestConfirmation(
      'Delete dealership branch',
      'This will permanently delete this dealership branch. All associated data will be unlinked. This cannot be undone.',
      'Delete branch',
      async () => {
        try {
          const res = await fetch(`${API_BASE}/dealerships/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.message || 'Unable to delete dealership');
          setDealerships(prev => prev.filter(d => d._id !== id && d.id !== id));
          addLog({ action: 'DEALERSHIP_DELETED', target: `Branch #${id.toString().substring(0, 8)}`, badgeClass: 'badge-coral', badgeText: 'BRANCH DELETED', description: 'Deleted dealership branch.' });
          showSnackbar('Dealership branch deleted.', 'info');
        } catch (error) { showSnackbar(error.message, 'error'); }
      }
    );
  };

  // ── Render current page view ─────────────────────────────────────────────────
  const renderView = () => {
    switch (activeTab) {
      case 'network-dashboard': return (
        <AdminDashboardView
          dealers={dealerships}
          users={users}
          customers={customers}
          complaints={complaints}
          analytics={analytics}
          reportFilters={reportFilters}
          setReportFilters={setReportFilters}
          searchQuery={q}
          onAddDealer={() => { setEditingDealership(null); setShowDealershipModal(true); }}
          onGoToPerformance={() => setActiveTab('dealer-performance')}
        />
      );
      case 'dealer-performance': return (
        <DealerPerformanceView
          dealers={dealerships}
          users={users}
          customers={customers}
          complaints={complaints}
          analytics={analytics}
          globalSearchQuery={q}
          onAddDealer={() => { setEditingDealership(null); setShowDealershipModal(true); }}
          onViewDealerDashboard={openDealerWorkspace}
        />
      );
      case 'dashboard':  return <DashboardView customers={filteredCustomers} complaints={filteredComplaints} historyLogs={filteredHistory} getCustName={getCustName} setActiveTab={setActiveTab} onInspectComplaint={(complaintId) => { setSelectedComplaintId(complaintId); setActiveTab('comparison'); }} onNewCustomer={() => { setEditingCustomer(null); setCustForm({ name: '', mobile: '+91 ', email: '', vehicleNumber: '', vehicleModel: '', serviceCenter: serviceCenters[0]?.name || 'Downtown Branch' }); setShowCustomerModal(true); }} onNewLink={() => setShowLinkModal(true)} searchQuery={q} />;
      case 'history':    return <HistoryView historyLogs={filteredHistory} complaints={filteredComplaints} customers={filteredCustomers} getCustName={getCustName} searchQuery={q} />;

      case 'customers':  return (
        <CustomersView
          customers={filteredCustomers}
          onNewCustomer={() => { setEditingCustomer(null); setCustForm({ name: '', mobile: '+91 ', email: '', vehicleNumber: '', vehicleModel: '', serviceCenter: serviceCenters[0]?.name || 'Downtown Branch' }); setShowCustomerModal(true); }}
          onEditCustomer={handleEditCustomer}
          onDeleteCustomer={handleDeleteCustomer}
          onViewCustomerComplaints={(c) => { setSearchQuery(c.vehicleNumber || c.vehicle_number || c.name); setActiveTab('complaints'); }}
          searchQuery={q}
        />
      );
      case 'links':      return <LinksView feedbackLinks={filteredLinks} customers={scopedCustomers} getCustName={getCustName} onNewLink={() => setShowLinkModal(true)} onDeleteLink={handleDeleteLink} onResendLink={handleResendLink} searchQuery={q} />;
      case 'complaints': return (
        <ComplaintsView
          complaints={filteredComplaints}
          getCustName={getCustName}
          onUploadInvoice={openInvoiceUpload}
          onDeleteVoiceNote={handleDeleteVoiceNote}
          onDeleteInvoicePdf={handleDeleteInvoicePdf}
          onServiceStatusChange={handleServiceStatusChange}

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
      case 'service-centers': return (
        <ServiceCentersView
          serviceCenters={filteredServiceCenters}
          onAddServiceCenter={async (payload) => {
            await handleAddServiceCenter(payload.name, payload.branch || payload.location, payload.managerEmail, undefined, payload.phone);
          }}
          onUpdateServiceCenter={async (id, payload) => {
            await handleAddServiceCenter(payload.name, payload.branch || payload.location, payload.managerEmail, id, payload.phone);
          }}
          onDeleteServiceCenter={handleRemoveServiceCenter}
          searchQuery={q}
        />
      );

      case 'dealers':
      case 'dealerships': return (
        <DealersView
          dealers={dealerships}
          users={users}
          customers={customers}
          complaints={complaints}
          user={user}
          onAddDealer={() => { setEditingDealership(null); setShowDealershipModal(true); }}
          onEditDealer={(d) => { setEditingDealership(d); setShowDealershipModal(true); }}
          onDeleteDealer={handleDeleteDealership}
          onAddServiceAdvisor={(dealerId) => { setUserModalError(''); setUserForm({ name: '', email: '', password: '', phone: '+91 ', role: 'STAFF', dealershipId: dealerId || '' }); setShowUserModal(true); }}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
          onViewDealerDashboard={openDealerWorkspace}
          searchQuery={q}
        />
      );

      case 'users': return (
        <UsersView
          users={filteredUsers}
          user={user}
          onAddUser={() => { setUserModalError(''); setUserForm({ name: '', email: '', password: '', phone: '+91 ', role: 'STAFF', dealershipId: effectiveDealerId || '' }); setShowUserModal(true); }}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
          searchQuery={q}
        />
      );
      case 'reports': return (
        <ReportsView
          customers={scopedCustomers}
          complaints={scopedComplaints}
          feedbackLinks={scopedLinks}
          serviceCenters={scopedServiceCenters}
          analytics={analytics}
          reportFilters={reportFilters}
          setReportFilters={setReportFilters}
          onExport={downloadExecutiveReport}
          setActiveTab={setActiveTab}
          setSearchQuery={setSearchQuery}
        />
      );
      default: return user?.role === 'ADMIN'
        ? <AdminDashboardView analytics={analytics} reportFilters={reportFilters} setReportFilters={setReportFilters} searchQuery={q} onAddDealer={() => { setEditingDealership(null); setShowDealershipModal(true); }} onGoToPerformance={() => setActiveTab('dealer-performance')} />
        : <DashboardView customers={filteredCustomers} complaints={filteredComplaints} historyLogs={filteredHistory} getCustName={getCustName} setActiveTab={setActiveTab} onInspectComplaint={(complaintId) => { setSelectedComplaintId(complaintId); setActiveTab('comparison'); }} onNewCustomer={() => { setEditingCustomer(null); setShowCustomerModal(true); }} onNewLink={() => setShowLinkModal(true)} searchQuery={q} />;
    }
  };

  return (
    <div className={`app-layout${siderailCollapsed ? ' siderail-collapsed' : ''}`}>
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
        onSecurity={() => { setMfaSetup(null); setMfaSettingsCode(''); setShowSecurityModal(true); }}
        dealerContext={isAdminDealerContext}
      />

      {/* Main app body right of sidebar */}
      <div className="app-main" style={{ marginLeft: siderailCollapsed ? 'var(--rail-collapsed)' : 'var(--rail-full)' }}>
        {/* Top Header */}
        <TopHeader
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          activeTab={activeTab}
          user={user}
          dealerships={dealerships}
          activeDealershipId={activeDealershipId}
          setActiveDealershipId={changeAdminDealership}
          dealerContext={isAdminDealerContext}
        />

        {/* Dynamic page content */}
        <main className="app-content">
          {isAdminDealerContext && viewingDealer && (
            <div style={{
              background: 'linear-gradient(90deg, #2563EB 0%, #1D4ED8 100%)',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '0.75rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 600,
              fontSize: '0.88rem',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🏢</span>
                <div>
                  <div>Admin Dealer Workspace: <strong>{viewingDealer.name}</strong></div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 400 }}>
                    {[viewingDealer.city, viewingDealer.code ? `Code: ${viewingDealer.code}` : '', viewingDealer.managerEmail].filter(Boolean).join('  ·  ')}
                  </div>
                </div>
              </div>
              <button
                onClick={() => changeAdminDealership('')}
                style={{
                  background: '#ffffff',
                  color: '#1D4ED8',
                  border: 'none',
                  padding: '0.4rem 0.9rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                ← Exit Dealer Workspace
              </button>
            </div>
          )}
          {renderView()}
        </main>
      </div>

      {/* ── Global Modals ────────────────────────────────────────────────────────── */}

      {showCustomerModal && (
        <CustomerModal
          onClose={() => { setShowCustomerModal(false); setEditingCustomer(null); }}
          custForm={custForm}
          setCustForm={setCustForm}
          onSubmit={handleCreateCustomer}
          serviceCenters={filteredServiceCenters}
          isEditing={!!editingCustomer}
          loading={customerModalLoading}
        />
      )}

      {showLinkModal && (
        <LinkModal
          onClose={() => setShowLinkModal(false)}
          customers={scopedCustomers}
          selectedCustomerId={selectedCustomerId}
          setSelectedCustomerId={setSelectedCustomerId}
          onSubmit={handleCreateLink}
        />
      )}

      {showInvoiceModal && (
        <InvoiceModal
          onClose={() => setShowInvoiceModal(false)}
          complaints={scopedComplaints}
          customers={scopedCustomers}
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
          dealerships={dealerships}
          currentUser={user}
          loading={userModalLoading}
          error={userModalError}
        />
      )}

      {showDealershipModal && (
        <DealershipModal
          onClose={() => { setShowDealershipModal(false); setEditingDealership(null); }}
          onSave={handleCreateDealership}
          editingDealership={editingDealership}
        />
      )}

      {showSecurityModal && <Modal title="Account Security" onClose={() => setShowSecurityModal(false)}>
        <div style={{ padding: '.8rem', marginBottom: '1rem', background: 'var(--primary-soft)', border: 'var(--border)' }}><strong>Authenticator app MFA</strong><p className="table-muted" style={{ margin: '.35rem 0 0' }}>Protect this administrator account with a rotating 6-digit code.</p></div>
        {!user?.mfaEnabled && !mfaSetup && <button className="btn btn-primary btn-full" onClick={async () => { const response = await fetch(`${API_BASE}/auth/mfa/setup`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); const result = await response.json(); result.success ? setMfaSetup(result.data) : showSnackbar(result.message || 'MFA setup failed.', 'error'); }}>Set Up MFA</button>}
        {mfaSetup && <><div className="form-group"><label className="form-label">Setup key</label><input className="form-input" value={mfaSetup.secret} readOnly /></div><p className="table-muted">Add this key in Google Authenticator, Microsoft Authenticator, or another TOTP app.</p><div className="form-group"><label className="form-label">Enter the generated 6-digit code</label><input className="form-input" inputMode="numeric" maxLength={6} value={mfaSettingsCode} onChange={event => setMfaSettingsCode(event.target.value.replace(/\D/g, ''))} /></div><button className="btn btn-primary btn-full" disabled={mfaSettingsCode.length !== 6} onClick={async () => { const response = await fetch(`${API_BASE}/auth/mfa/enable`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ code: mfaSettingsCode }) }); const result = await response.json(); if (result.success) { const updated = { ...user, mfaEnabled: true }; setUser(updated); sessionStorage.setItem('admin_user', JSON.stringify(updated)); setShowSecurityModal(false); showSnackbar('MFA enabled for your account.', 'success'); } else showSnackbar(result.message || 'Invalid authentication code.', 'error'); }}>Enable MFA</button></>}
        {user?.mfaEnabled && <><div className="stat-badge badge-green" style={{ marginBottom: '1rem' }}>MFA ENABLED</div><div className="form-group"><label className="form-label">Current authentication code</label><input className="form-input" inputMode="numeric" maxLength={6} value={mfaSettingsCode} onChange={event => setMfaSettingsCode(event.target.value.replace(/\D/g, ''))} /></div><button className="btn btn-danger btn-full" disabled={mfaSettingsCode.length !== 6} onClick={async () => { const response = await fetch(`${API_BASE}/auth/mfa/disable`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ code: mfaSettingsCode }) }); const result = await response.json(); if (result.success) handleLogout(); else showSnackbar(result.message || 'Unable to disable MFA.', 'error'); }}>Disable MFA & Sign Out</button></>}
      </Modal>}

      {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={saveEditedUser} />}
      {confirmation && <ConfirmModal {...confirmation} onClose={() => setConfirmation(null)} />}
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
