import React from 'react';
import { BuildingIcon, UsersIcon, CarIcon, CpuIcon, ZapIcon, ExternalLinkIcon, MailIcon, ShieldIcon, ReportsIcon } from '../components/Icons';

const formatNumber = value => new Intl.NumberFormat('en-IN').format(Number(value || 0));
const money = value => `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(value || 0))}`;
const tone = (kind) => ({ blue: ['#EFF6FF','#2563EB','#BFDBFE'], green: ['#ECFDF5','#059669','#A7F3D0'], amber: ['#FFFBEB','#D97706','#FDE68A'], red: ['#FEF2F2','#DC2626','#FECACA'], purple: ['#F5F3FF','#7C3AED','#DDD6FE'], cyan: ['#ECFEFF','#0891B2','#A5F3FC'] }[kind]);

function Kpi({ label, value, sub, icon: Icon, color = 'blue' }) {
  const [bg, accent, border] = tone(color);
  return <div style={{ background:'#fff', border:`1px solid ${border}`, borderRadius:8, padding:'1rem 1.1rem', position:'relative' }}>
    <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:accent }} />
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}><span style={{ fontSize:'.68rem', fontWeight:750, color:'#71717A', textTransform:'uppercase', letterSpacing:'.05em' }}>{label}</span><span style={{ width:30, height:30, display:'grid', placeItems:'center', background:bg, color:accent }}><Icon size={14}/></span></div>
    <div style={{ fontSize:'1.65rem', fontWeight:850, marginTop:'.35rem', color:'#18181B' }}>{value}</div>
    <div style={{ fontSize:'.72rem', color:'#71717A', marginTop:'.25rem' }}>{sub}</div>
  </div>;
}

function DateFilters({ filters, setFilters }) {
  const preset = days => { const to = new Date(); const from = new Date(to.getTime() - (days - 1) * 86400000); setFilters({ from:from.toISOString().slice(0,10), to:to.toISOString().slice(0,10) }); };
  return <div style={{ display:'flex', gap:'.45rem', alignItems:'center', flexWrap:'wrap' }}>
    {[7,30,90].map(days => <button key={days} className="btn btn-secondary btn-sm" onClick={() => preset(days)}>{days} days</button>)}
    <input className="form-input" type="date" value={filters.from} onChange={e => setFilters({ ...filters, from:e.target.value })} style={{ width:140, padding:'.38rem .55rem' }}/>
    <span style={{ color:'#A1A1AA' }}>to</span>
    <input className="form-input" type="date" value={filters.to} onChange={e => setFilters({ ...filters, to:e.target.value })} style={{ width:140, padding:'.38rem .55rem' }}/>
  </div>;
}

export default function AdminDashboardView({ analytics, reportFilters, setReportFilters, onAddDealer, onGoToPerformance }) {
  if (!analytics) return <div className="card"><div className="empty-state"><div className="empty-state-msg">Loading verified management analytics…</div></div></div>;
  const o = analytics.overview || {};
  const comms = analytics.communications || {};
  const feedback = analytics.feedback || {};
  const invoices = analytics.invoices || {};
  const ranking = analytics.dealerRanking || [];
  const trend = analytics.trends || [];
  const maxTrend = Math.max(1, ...trend.map(row => row.complaints + row.audits));
  const cards = [
    ['Active Dealers', formatNumber(o.activeDealers), 'Enabled dealership branches', BuildingIcon, 'blue'],
    ['Enabled Advisors', formatNumber(o.enabledAdvisors), 'Active staff accounts', UsersIcon, 'purple'],
    ['Signed-in Users', formatNumber(o.activeSignedInUsers), 'Distinct valid login sessions', UsersIcon, 'cyan'],
    ['Customers', formatNumber(o.totalCustomers), `${formatNumber(o.newCustomers)} added in selected period`, CarIcon, 'amber'],
    ['Complaints', formatNumber(o.complaints), `${formatNumber(o.resolvedCases)} resolved in period`, ShieldIcon, 'blue'],
    ['Open Backlog', formatNumber(o.openCases), `${formatNumber(o.slaBreaches)} over ${analytics.filters?.slaMinutes || 30}-minute SLA`, ShieldIcon, o.slaBreaches ? 'red' : 'green'],
    ['Completed Audits', formatNumber(o.completedAudits), `${o.auditCompletionRate || 0}% of submitted complaints`, CpuIcon, 'green'],
    ['Average Match', o.averageMatchScore == null ? '—' : `${o.averageMatchScore}%`, 'Invoice-to-feedback match score', ZapIcon, 'green'],
    ['High-risk Flags', formatNumber(o.fraudFlags), `${formatNumber(o.managerReviewPending)} awaiting manager review`, ShieldIcon, o.fraudFlags ? 'red' : 'green'],
    ['Invoice Value', money(invoices.totalValue), `${formatNumber(invoices.parsed)}/${formatNumber(invoices.uploaded)} parsed`, ReportsIcon, 'amber'],
    ['Feedback Response', `${feedback.responseRate || 0}%`, `${formatNumber(feedback.submitted)}/${formatNumber(feedback.generated)} submitted`, MailIcon, 'purple'],
    ['Delivery Rate', `${comms.deliveryRate || 0}%`, `${formatNumber(comms.failed)} failed of ${formatNumber(comms.attempts)} attempts`, MailIcon, comms.failed ? 'red' : 'cyan'],
  ];
  return <div>
    <div className="page-header"><div><h1 className="page-title">Network Overview</h1><p className="page-subtitle">Verified management KPIs from live tenant-isolated operational records</p></div><div className="page-actions"><button className="btn btn-secondary" onClick={onGoToPerformance}><CpuIcon size={14}/> Dealer Performance <ExternalLinkIcon size={12}/></button><button className="btn btn-primary" onClick={onAddDealer}>+ Add Dealer</button></div></div>
    <div style={{ background:'#fff', border:'1px solid #E4E4E7', padding:'.8rem 1rem', marginBottom:'1rem', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}><DateFilters filters={reportFilters} setFilters={setReportFilters}/><span style={{ fontSize:'.72rem', color:'#71717A' }}>Generated {new Date(analytics.generatedAt).toLocaleString('en-IN')}</span></div>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))', gap:'.8rem' }}>{cards.map(([label,value,sub,icon,color]) => <Kpi key={label} label={label} value={value} sub={sub} icon={icon} color={color}/>)}</div>
    <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:'1rem', marginTop:'1rem' }}>
      <section className="card"><div className="card-header"><div><h3 className="card-title">Complaint & audit trend</h3><span className="card-subtitle">Daily volume for the selected period (latest 90 days shown)</span></div></div><div style={{ padding:'1rem', height:210, display:'flex', alignItems:'end', gap:3, overflowX:'auto' }}>{trend.map(row => <div key={row.date} title={`${row.date}: ${row.complaints} complaints, ${row.audits} audits`} style={{ minWidth:8, flex:1, maxWidth:22, height:'100%', display:'flex', alignItems:'end', gap:1 }}><div style={{ width:'50%', height:`${Math.max(2,(row.complaints/maxTrend)*100)}%`, background:'#2563EB' }}/><div style={{ width:'50%', height:`${Math.max(2,(row.audits/maxTrend)*100)}%`, background:'#059669' }}/></div>)}</div><div style={{ padding:'0 1rem 1rem', fontSize:'.72rem', color:'#71717A' }}><span style={{ color:'#2563EB' }}>■</span> Complaints &nbsp; <span style={{ color:'#059669' }}>■</span> Audits</div></section>
      <section className="card"><div className="card-header"><div><h3 className="card-title">Operational quality</h3><span className="card-subtitle">Customer and workflow health</span></div></div><div style={{ padding:'1rem', display:'grid', gap:'.7rem' }}>{[['Customer rating',o.averageRating == null?'No ratings':`${o.averageRating}/5 (${o.ratingCount})`],['Avg resolution time',o.averageResolutionHours == null?'Not available':`${o.averageResolutionHours} hours`],['Flagged invoice value',money(invoices.flaggedInvoiceValue)],['Manager review pending',formatNumber(o.managerReviewPending)]].map(([label,value]) => <div key={label} style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid #F4F4F5', paddingBottom:'.55rem', fontSize:'.8rem' }}><span style={{ color:'#71717A' }}>{label}</span><strong>{value}</strong></div>)}</div></section>
    </div>
    <section className="card" style={{ marginTop:'1rem' }}><div className="card-header"><div><h3 className="card-title">Dealer ranking</h3><span className="card-subtitle">Ranked using real audit results for the selected period</span></div><button className="btn btn-secondary btn-sm" onClick={onGoToPerformance}>Full breakdown</button></div><div className="table-container"><table className="custom-table"><thead><tr><th>#</th><th>Dealer</th><th>Customers</th><th>Complaints</th><th>Audits</th><th>Completion</th><th>Avg Match</th><th>Flags</th></tr></thead><tbody>{ranking.slice(0,5).map((row,index)=><tr key={row.dealershipId}><td>{index+1}</td><td><strong>{row.name}</strong><div className="table-muted">{row.city || '—'}</div></td><td>{row.customers}</td><td>{row.complaints}</td><td>{row.audits}</td><td>{row.completionRate}%</td><td>{row.averageScore == null?'—':`${row.averageScore}%`}</td><td><span className={`stat-badge ${row.flags?'badge-coral':'badge-green'}`}>{row.flags}</span></td></tr>)}</tbody></table></div></section>
  </div>;
}
