import React, { useState } from "react";
import { PlusIcon, TrashIcon, EditIcon, BuildingIcon, UsersIcon, CarIcon, CpuIcon } from "../components/Icons";

const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

function DealerDashboard({ dealer, customers, complaints, users=[], user, onBack, onAddServiceAdvisor, onEditUser, onDeleteUser }) {
  const id = dealer._id || dealer.id;
  const dealerCusts = customers.filter(c => c.dealerId === id || c.dealershipId === id);
  const dealerComps = complaints.filter(c => dealerCusts.some(cu => (cu._id || cu.id) === c.customerId));
  const dealerAdvisors = users.filter(u => (u.dealershipId === id || u.dealerId === id) && u.role === "STAFF");
  
  const auditsDone  = dealerComps.filter(c => c.status === "COMPARED" || c.aiComparison).length;
  const scores      = dealerComps.map(c => Number(c.aiComparison?.matchPercentage ?? c.comparisonScore)).filter(Number.isFinite);
  const avgScore    = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  return (
    <div>
      {/* Navigation header */}
      <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1.5rem" }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:"0.4rem", background:"transparent", border:"1px solid #E4E4E7", borderRadius:"6px", padding:"0.35rem 0.75rem", fontSize:"0.8rem", fontWeight:600, color:"#52525B", cursor:"pointer" }}>
          <BackIcon /> Back to Dealers
        </button>
        <span style={{ fontSize:"0.8rem", color:"#A1A1AA" }}>Dealers / <strong style={{ color:"#18181B" }}>{dealer.name}</strong></span>
      </div>

      {/* Dealer summary card */}
      <div style={{ background:"#F8F8FA", border:"1px solid #E4E4E7", borderRadius:"8px", padding:"1rem 1.25rem", marginBottom:"1.5rem", display:"flex", alignItems:"center", gap:"1rem", flexWrap:"wrap" }}>
        <div style={{ width:40, height:40, borderRadius:"8px", background:"#EFF6FF", color:"#2563EB", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontWeight:800, fontSize:"1.1rem" }}>
          <BuildingIcon size={20} />
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize:"1rem", color:"#18181B" }}>{dealer.name}</div>
          <div style={{ fontSize:"0.78rem", color:"#71717A" }}>
            {[dealer.city, dealer.managerEmail, dealer.phone].filter(Boolean).join("  ·  ")}
          </div>
        </div>
        <span style={{ fontSize:"0.7rem", fontWeight:700, background:"#ECFDF5", color:"#059669", border:"1px solid #A7F3D0", padding:"0.2rem 0.6rem", borderRadius:"4px" }}>Active Branch</span>
      </div>

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"1.5rem" }}>
        {[
          { label:"Service Advisors", value: dealerAdvisors.length, color:"#7C3AED", bg:"#F5F3FF" },
          { label:"Customers", value: dealerCusts.length, color:"#2563EB", bg:"#EFF6FF" },
          { label:"Complaints", value: dealerComps.length, color:"#D97706", bg:"#FFFBEB" },
          { label:"Avg Audit Score", value: avgScore !== null ? `${avgScore}%` : "—", color:"#059669", bg:"#ECFDF5" },
        ].map(s => (
          <div key={s.label} style={{ background:"#fff", border:"1px solid #E4E4E7", borderRadius:"8px", padding:"1.25rem" }}>
            <div style={{ fontSize:"0.7rem", fontWeight:700, color:"#A1A1AA", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"0.35rem" }}>{s.label}</div>
            <div style={{ fontSize:"1.65rem", fontWeight:800, color:"#18181B" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Service Advisors Section */}
      <div style={{ background:"#fff", border:"1px solid #E4E4E7", borderRadius:"8px", overflow:"hidden", marginBottom:"1.5rem" }}>
        <div style={{ padding:"1rem 1.25rem", borderBottom:"1px solid #E4E4E7", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <span style={{ fontWeight:700, fontSize:"0.9rem" }}>Service Advisors (Dealer Staff)</span>
            <span style={{ fontSize:"0.78rem", color:"#A1A1AA", marginLeft:"0.5rem" }}>({dealerAdvisors.length})</span>
          </div>
          <button
            className="btn btn-primary btn-sm"
            style={{ fontSize:"0.78rem", padding:"0.3rem 0.75rem" }}
            onClick={() => onAddServiceAdvisor && onAddServiceAdvisor(id)}
          >
            <PlusIcon size={14} /> Add Service Advisor
          </button>
        </div>

        {dealerAdvisors.length === 0 ? (
          <div style={{ padding:"3rem 1.5rem", textAlign:"center" }}>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:"0.75rem", color:"#A1A1AA" }}>
              <UsersIcon size={36} />
            </div>
            <h4 style={{ fontWeight:700, fontSize:"0.95rem", color:"#18181B", marginBottom:"0.35rem" }}>No Service Advisors Created</h4>
            <p style={{ fontSize:"0.82rem", color:"#71717A", maxWidth:360, margin:"0 auto 1.25rem", lineHeight:1.5 }}>
              Add service advisors to manage customer registrations, voice notes, and invoices for this dealer branch.
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onAddServiceAdvisor && onAddServiceAdvisor(id)}
            >
              <PlusIcon size={14} /> Add First Service Advisor
            </button>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr><th>#</th><th>Advisor Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {dealerAdvisors.map((u, i) => (
                <tr key={u._id || u.id || i}>
                  <td style={{ color:"#A1A1AA", fontSize:"0.75rem", width:36 }}>{i + 1}</td>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:"0.55rem" }}>
                      <div style={{ width:28, height:28, borderRadius:"6px", background:"#F4F4F5", color:"#52525B", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:"0.72rem", flexShrink:0 }}>
                        {(u.name || "S")[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight:600, fontSize:"0.85rem", color:"#18181B" }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize:"0.8rem", color:"#52525B" }}>{u.email}</td>
                  <td style={{ fontSize:"0.8rem", color:"#71717A" }}>{u.phone || u.mobile || "—"}</td>
                  <td>
                    <span style={{ fontSize:"0.68rem", fontWeight:700, background:"#F4F4F5", color:"#52525B", border:"1px solid #E4E4E7", padding:"0.15rem 0.5rem", borderRadius:"4px" }}>
                      Service Advisor
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize:"0.68rem", fontWeight:700, background:"#ECFDF5", color:"#059669", border:"1px solid #A7F3D0", padding:"0.15rem 0.5rem", borderRadius:"4px" }}>Active</span>
                  </td>
                  <td>
                    <div style={{ display:"flex", gap:"0.35rem" }}>
                      <button className="btn btn-secondary btn-sm" style={{ padding:"0.2rem 0.45rem", fontSize:"0.75rem" }} onClick={() => onEditUser && onEditUser(u)} title="Edit advisor">
                        <EditIcon size={12} />
                      </button>
                      <button className="btn btn-secondary btn-sm" style={{ padding:"0.2rem 0.45rem", color:"#DC2626", borderColor:"#FECACA", fontSize:"0.75rem" }} onClick={() => onDeleteUser && onDeleteUser(u._id || u.id)} title="Delete advisor">
                        <TrashIcon size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Registered Customers Section */}
      <div style={{ background:"#fff", border:"1px solid #E4E4E7", borderRadius:"8px", overflow:"hidden" }}>
        <div style={{ padding:"1rem 1.25rem", borderBottom:"1px solid #E4E4E7", fontWeight:700, fontSize:"0.9rem" }}>Registered Customers</div>
        {dealerCusts.length === 0 ? (
          <div style={{ padding:"3rem", textAlign:"center", color:"#A1A1AA", fontSize:"0.85rem" }}>No customers registered under this dealer yet.</div>
        ) : (
          <table className="custom-table">
            <thead><tr><th>#</th><th>Name</th><th>Vehicle</th><th>Mobile</th><th>Service Center</th></tr></thead>
            <tbody>
              {dealerCusts.map((c, i) => (
                <tr key={c._id||c.id}>
                  <td style={{ color:"#A1A1AA", fontSize:"0.75rem" }}>{i+1}</td>
                  <td style={{ fontWeight:600 }}>{c.name}</td>
                  <td style={{ fontSize:"0.82rem", color:"#52525B" }}>{c.vehicleNumber} · {c.vehicleModel}</td>
                  <td style={{ fontSize:"0.82rem", color:"#52525B" }}>{c.mobile}</td>
                  <td style={{ fontSize:"0.82rem", color:"#52525B" }}>{c.serviceCenter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function DealersView({ dealers=[], customers=[], complaints=[], users=[], user, onAddDealer, onEditDealer, onDeleteDealer, onAddServiceAdvisor, onEditUser, onDeleteUser, onViewDealerDashboard, searchQuery="" }) {
  const [activeDashboard, setActiveDashboard] = useState(null);
  const isAdmin = user?.role === "ADMIN";

  if (activeDashboard) {
    return (
      <DealerDashboard
        dealer={activeDashboard}
        customers={customers}
        complaints={complaints}
        users={users}
        user={user}
        onBack={() => setActiveDashboard(null)}
        onAddServiceAdvisor={onAddServiceAdvisor}
        onEditUser={onEditUser}
        onDeleteUser={onDeleteUser}
      />
    );
  }

  const filtered = searchQuery
    ? dealers.filter(d => (d.name||"").toLowerCase().includes(searchQuery.toLowerCase()) || (d.city||"").toLowerCase().includes(searchQuery.toLowerCase()) || (d.managerEmail||"").toLowerCase().includes(searchQuery.toLowerCase()))
    : dealers;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dealers Portal</h1>
          <p className="page-subtitle">Super Admin — Monitor dealer branches, service advisors, app usage, and customer audit progress</p>
        </div>
        {isAdmin && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={onAddDealer}><PlusIcon size={15} /> Add Dealer Branch</button>
          </div>
        )}
      </div>

      {/* Summary KPI Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"1.5rem" }}>
        {[
          { label:"Registered Dealers", value: dealers.length, color:"#2563EB" },
          { label:"Service Advisors Created", value: users.filter(u => u.role === "STAFF").length, color:"#7C3AED" },
          { label:"Active App Users", value: users.filter(u => u.role === "DEALER" || u.role === "STAFF").length, color:"#059669" },
          { label:"Total Managed Customers", value: customers.length, color:"#D97706" },
        ].map(s => (
          <div key={s.label} style={{ background:"#fff", border:"1px solid #E4E4E7", borderRadius:"8px", padding:"1rem 1.25rem" }}>
            <div style={{ fontSize:"0.68rem", fontWeight:700, color:"#A1A1AA", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"0.35rem" }}>{s.label}</div>
            <div style={{ fontSize:"1.65rem", fontWeight:800, color: s.color || "#18181B" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background:"#fff", border:"1px solid #E4E4E7", borderRadius:"8px", overflow:"hidden" }}>
        <div style={{ padding:"1rem 1.25rem", borderBottom:"1px solid #E4E4E7", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontWeight:700, fontSize:"0.9rem" }}>Active Dealer Branches <span style={{ fontSize:"0.78rem", color:"#A1A1AA", fontWeight:400 }}>({filtered.length})</span></span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding:"4rem 1.5rem", textAlign:"center" }}>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:"1rem", color:"#A1A1AA" }}>
              <BuildingIcon size={40} />
            </div>
            <h3 style={{ fontWeight:700, fontSize:"1rem", color:"#18181B", marginBottom:"0.5rem" }}>{searchQuery ? `No dealers match "${searchQuery}"` : "No Dealers Yet"}</h3>
            <p style={{ fontSize:"0.85rem", color:"#71717A", maxWidth:380, margin:"0 auto 1.5rem", lineHeight:1.6 }}>Add your first dealer branch. Each dealer gets an isolated dashboard with their own service advisors.</p>
            {isAdmin && <button className="btn btn-primary" onClick={onAddDealer}><PlusIcon size={15} /> Add First Dealer</button>}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="custom-table dealer-branches-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Dealer Branch</th>
                  <th>City</th>
                  <th>Manager Email</th>
                  <th>Phone</th>
                  <th>Advisors</th>
                  <th>App Users</th>
                  <th>Customers</th>
                  <th>Completed</th>
                  <th>Ongoing</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, idx) => {
                  const id = d._id || d.id;
                  const dealerUsers = users.filter(u => u.dealershipId === id || u.dealerId === id);
                  const advisorsCount = dealerUsers.filter(u => u.role === "STAFF").length;
                  const activeUsersCount = dealerUsers.length;
                  const dealerCusts = customers.filter(c => c.dealerId === id || c.dealershipId === id);
                  const dealerComps = complaints.filter(c => c.dealershipId === id || dealerCusts.some(cu => (cu._id || cu.id) === (c.customerId || c.customer_id)));
                  const completedCount = dealerComps.filter(c => c.status === "COMPARED" || c.aiComparison).length;
                  const ongoingCount = Math.max(0, dealerCusts.length - completedCount);

                  return (
                    <tr key={id || idx}>
                      <td style={{ color:"#A1A1AA", fontSize:"0.75rem", width:32 }}>{idx+1}</td>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
                          <div style={{ width:30, height:30, borderRadius:"6px", background:"#EFF6FF", color:"#2563EB", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontWeight:800, fontSize:"0.85rem" }}>
                            {(d.name||"D")[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight:700, fontSize:"0.875rem", color:"#18181B" }}>{d.name}</div>
                            {d.code && <div style={{ fontSize:"0.68rem", color:"#A1A1AA", fontFamily:"monospace" }}>{d.code}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize:"0.82rem", color:"#52525B", fontWeight:500 }}>{d.city||"—"}</td>
                      <td style={{ fontSize:"0.78rem", color:"#52525B" }}>{d.managerEmail||"—"}</td>
                      <td style={{ fontSize:"0.82rem", color:"#71717A" }}>{d.phone||"—"}</td>
                      <td className="dealer-metric-cell">
                        <span className="dealer-count-badge dealer-count-badge--purple" title={`${advisorsCount} advisor${advisorsCount === 1 ? '' : 's'}`} aria-label={`${advisorsCount} advisor${advisorsCount === 1 ? '' : 's'}`}>
                          {advisorsCount}
                        </span>
                      </td>
                      <td className="dealer-metric-cell">
                        <span className="dealer-count-badge dealer-count-badge--green" title={`${activeUsersCount} app user${activeUsersCount === 1 ? '' : 's'}`} aria-label={`${activeUsersCount} app user${activeUsersCount === 1 ? '' : 's'}`}>
                          {activeUsersCount}
                        </span>
                      </td>
                      <td style={{ fontWeight:800, fontSize:"0.88rem", color:"#18181B" }}>{dealerCusts.length}</td>
                      <td>
                        <span style={{ fontWeight:700, fontSize:"0.78rem", color:"#059669" }}>
                          {completedCount}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight:700, fontSize:"0.78rem", color:"#D97706" }}>
                          {ongoingCount}
                        </span>
                      </td>
                      <td>
                        <div style={{ display:"flex", gap:"0.35rem", alignItems:"center", whiteSpace:"nowrap" }}>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ fontSize:"0.75rem", padding:"0.25rem 0.65rem" }}
                            onClick={() => onViewDealerDashboard ? onViewDealerDashboard(d) : setActiveDashboard(d)}
                            title="Open this dealer's complete workspace in a new tab"
                          >Open Dealer ↗</button>
                          {isAdmin && <>
                            <button className="btn btn-secondary btn-sm" style={{ padding:"0.25rem 0.5rem" }} onClick={() => onEditDealer&&onEditDealer(d)} title="Edit"><EditIcon size={12}/></button>
                            <button className="btn btn-secondary btn-sm" style={{ padding:"0.25rem 0.5rem", color:"#DC2626", borderColor:"#FECACA" }} onClick={() => onDeleteDealer&&onDeleteDealer(id)} title="Delete"><TrashIcon size={12}/></button>
                          </>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
